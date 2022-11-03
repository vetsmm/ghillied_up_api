import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    Action,
    Actor,
    AppLogger,
    PageInfo,
    parsePaginationArgs,
    PostSearchCriteria,
    RequestContext,
} from '../../shared';
import { PostAclService } from './post-acl.service';
import { CreatePostInputDto } from '../dtos/create-post-input.dto';
import { PostDetailDto } from '../dtos/post-detail.dto';
import {
    GhillieRole,
    MemberStatus,
    Post,
    PostStatus,
    PostTag,
    Prisma,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { plainToInstance } from 'class-transformer';
import { UpdatePostInputDto } from '../dtos/update-post-input.dto';
import { PostListingDto } from '../dtos/post-listing.dto';
import { QueueService } from '../../queue/services/queue.service';
import { ActivityType } from '../../shared/queue/activity-type';
import { GetStreamService } from '../../shared/getsream/getstream.service';
import { PostFeedVerb } from '../../shared/feed/feed.types';

@Injectable()
export class PostService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: AppLogger,
        private readonly postAclService: PostAclService,
        private readonly queueService: QueueService,
        private readonly streamService: GetStreamService,
    ) {
        this.logger.setContext(PostService.name);
    }

    // Create Post
    async createPost(
        ctx: RequestContext,
        postDto: CreatePostInputDto,
    ): Promise<PostDetailDto> {
        this.logger.log(ctx, `${this.createPost.name} was called`);
        // Check if the user is an active member of the ghillie
        const ghillieUser = await this.prisma.ghillieMembers.findFirst({
            where: {
                AND: [
                    { userId: ctx.user.id },
                    { ghillieId: postDto.ghillieId },
                ],
            },
            include: {
                ghillie: true,
                user: true,
            },
        });

        if (!ghillieUser) {
            throw new Error('You are not a member of this Ghillie');
        }
        if (
            ghillieUser.role !== GhillieRole.OWNER &&
            ghillieUser.memberStatus !== MemberStatus.ACTIVE
        ) {
            throw new Error('You are not allowed to post to this Ghillie');
        }

        // Check if the user has permission to post to this ghillie
        const actor: Actor = ctx.user;
        const isAllowed = this.postAclService
            .forActor(actor)
            .canDoAction(Action.Create);
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not allowed to create a post in this ghillie',
            );
        }

        const post = await this.prisma.$transaction(async (prisma) => {
            let tags = [] as Array<PostTag>;
            if (postDto.postTagNames) {
                tags = await Promise.all(
                    postDto.postTagNames.map(async (tagName) => {
                        return prisma.postTag.upsert({
                            where: {
                                name: tagName,
                            },
                            update: {},
                            create: {
                                name: tagName,
                            },
                        });
                    }),
                );
            }

            // create the post
            return await prisma.post.create({
                data: {
                    uid: randomUUID(),
                    title: postDto.title,
                    content: postDto.content,
                    ghillieId: postDto.ghillieId,
                    postedById: ctx.user.id,
                    tags: {
                        connect: tags.map((tag) => ({
                            id: tag.id,
                        })),
                    },
                },
                include: {
                    tags: true,
                    postedBy: true,
                    ghillie: true,
                    _count: {
                        select: {
                            postComments: true,
                            postReaction: true,
                        },
                    },
                },
            });
        });

        this.queueService
            .publishActivity(ctx, ActivityType.POST, {
                actor: ctx.user.id,
                verb: PostFeedVerb.POST,
                object: PostFeedVerb.POST,
                foreign_id: post.id,
                time: new Date().toISOString(),
                // This is the ghillie that the post was made in
                targetId: post.ghillieId,
                published: post.createdDate.toISOString(),
                //This is the ID of the ghillie here the activity was made.
                ghillieId: post.ghillieId,
                tags: post.tags.map((tag) => ({
                    name: tag.name,
                    id: tag.id,
                })),
                commentCount: post._count.postComments,
                reactionCount: post._count.postReaction,
                aggregateReactionTypeCounts: {},
            })
            .then((res) => {
                this.logger.log(ctx, `Activity published to queue: ${res}`);
            })
            .catch((err) => {
                this.logger.error(ctx, err.message);
            });
        this.streamService
            .addPostActivity({
                actor: ctx.user.id,
                verb: PostFeedVerb.POST,
                object: PostFeedVerb.POST,
                foreign_id: `post:${post.id}`,
                time: new Date().toISOString(),
                targetId: post.ghillieId,
                published: post.createdDate.toISOString(),
                data: {
                    ghillieId: post.ghillieId,
                    postedById: post.postedById,
                    tags: post.tags.map((tag: PostTag) => ({
                        name: tag.name,
                        id: tag.id,
                    })),
                    status: post.status,
                    id: post.id,
                    uid: post.uid,
                    title: post.title,
                    content: post.content,
                    createdDate: post.createdDate,
                    updatedDate: post.updatedDate,
                    edited: post.edited,
                },
            })
            .then(async (res) => {
                this.logger.log(
                    ctx,
                    `Activity added to feed with ID: ${res.id}`,
                );
                await this.prisma.post.update({
                    where: {
                        id: post.id,
                    },
                    data: {
                        activityId: res.id,
                    },
                });
            })
            .catch((err) => {
                this.logger.error(ctx, `Error adding activity to feed: ${err}`);
            });

        const dto = plainToInstance(PostDetailDto, post, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
        dto.tags = post.tags.map((tag) => tag.name);
        return dto;
    }

    async updatePost(
        ctx: RequestContext,
        id: string,
        postDto: UpdatePostInputDto,
    ) {
        this.logger.log(ctx, `${this.updatePost.name} was called`);

        const foundPost = await this.prisma.post.findFirst({
            where: {
                id,
            },
            include: {
                ghillie: true,
            },
        });

        if (!foundPost) {
            throw new NotFoundException('Post not found');
        }

        // Check if the user is an active member of the ghillie
        const ghillieUser = await this.prisma.ghillieMembers.findFirst({
            where: {
                AND: [
                    { userId: ctx.user.id },
                    { ghillieId: foundPost.ghillieId },
                ],
            },
        });

        if (!ghillieUser) {
            throw new Error('You are not a member of this Ghillie');
        }
        if (ghillieUser.memberStatus !== MemberStatus.ACTIVE) {
            throw new Error('You are not allowed to post to this Ghillie');
        }

        // Check if the user has permission update this post
        const actor: Actor = ctx.user;
        const isAllowed = this.postAclService
            .forActor(actor)
            .canDoAction(Action.Update, foundPost);
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not authorized to update this post',
            );
        }

        const updatedPost = await this.prisma.$transaction(async (prisma) => {
            if (postDto.content !== undefined) {
                foundPost.content = postDto.content;
            }
            if (postDto.status !== undefined) {
                foundPost.status = postDto.status;
            }

            return await prisma.post.update({
                where: {
                    id,
                },
                data: {
                    content: foundPost.content,
                    status: foundPost.status,
                    edited: true,
                },
                include: {
                    ghillie: true,
                    postedBy: true,
                    tags: true,
                    _count: {
                        select: {
                            postComments: true,
                            postReaction: true,
                        },
                    },
                    postReaction: {
                        where: {
                            createdById: ctx.user.id,
                        },
                    },
                },
            });
        });

        this.updateOrDeletePostFromFeed(ctx, updatedPost);

        const dto = plainToInstance(PostDetailDto, updatedPost, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
        dto.tags = updatedPost.tags.map((tag) => tag.name);
        return dto;
    }

    deletePostFromFeed(ctx: RequestContext, post: Post) {
        this.logger.log(ctx, 'Deleting post from feed');
        this.streamService
            .deletePostActivity(post.postedById, post.id)
            .then((res) => {
                this.logger.log(
                    ctx,
                    `Post deleted from feed: ${JSON.stringify(res)}`,
                );
            })
            .catch((err) => {
                this.logger.error(ctx, `Error deleting post from feed: ${err}`);
            });
    }

    updateOrDeletePostFromFeed(ctx: RequestContext, updatedPost: any) {
        if (updatedPost.status !== PostStatus.ACTIVE) {
            this.deletePostFromFeed(ctx, updatedPost);
            return;
        }

        this.streamService
            .getPostActivity(updatedPost.postedById, updatedPost.activityId)
            .then((res) => {
                const activity: any = res.results[0];
                activity.data.title = updatedPost.title;
                activity.data.content = updatedPost.content;
                activity.data.edited = updatedPost.edited;
                activity.data.tags = updatedPost.tags.map((tag: PostTag) => ({
                    name: tag.name,
                    id: tag.id,
                }));
                activity.data.status = updatedPost.status;
                this.streamService
                    .updatePostActivity(activity)
                    .then((res) => {
                        this.logger.log(
                            ctx,
                            `Post updated in feed: ${JSON.stringify(res)}`,
                        );
                    })
                    .catch((err) => {
                        this.logger.error(
                            ctx,
                            `Error updating post in feed: ${err}`,
                        );
                    });
            });
    }

    async getPostById(ctx: RequestContext, id: string) {
        this.logger.log(ctx, `${this.getPostById.name} was called`);

        const post = await this.prisma.post.findFirst({
            where: {
                id,
            },
            include: {
                ghillie: true,
                postedBy: true,
                tags: true,
                _count: {
                    select: {
                        postComments: true,
                        postReaction: true,
                    },
                },
                postReaction: {
                    where: {
                        createdById: ctx.user.id,
                    },
                },
            },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        const ghillieUser = await this.prisma.ghillieMembers.findFirst({
            where: {
                AND: [{ userId: ctx.user.id }, { ghillieId: post.ghillieId }],
            },
        });

        if (!ghillieUser) {
            throw new Error('You are not a member of this Ghillie');
        }
        if (ghillieUser.memberStatus !== MemberStatus.ACTIVE) {
            throw new Error(
                'You are not allowed to view posts in this Ghillie',
            );
        }

        const dto = plainToInstance(PostDetailDto, post, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
        dto.tags = post.tags.map((tag) => tag.name);
        return dto;
    }

    async getAllPosts(
        ctx: RequestContext,
        criteria: PostSearchCriteria,
    ): Promise<{
        posts: Array<PostListingDto>;
        count: number;
    }> {
        this.logger.log(ctx, `${this.getAllPosts.name} was called`);

        const ghillieUser = await this.prisma.ghillieMembers.findFirst({
            where: {
                AND: [
                    { userId: ctx.user.id },
                    { ghillieId: criteria.ghillieId },
                ],
            },
        });

        if (!ghillieUser) {
            throw new Error('You are not a member of this Ghillie');
        }
        if (ghillieUser.memberStatus !== MemberStatus.ACTIVE) {
            throw new Error(
                'You are not allowed to view posts in this Ghillie',
            );
        }

        const where = { AND: [] };
        if (criteria.title) {
            where.AND.push({
                title: { contains: criteria.title, mode: 'insensitive' },
            });
        }
        if (criteria.content) {
            where.AND.push({
                content: { contains: criteria.content, mode: 'insensitive' },
            });
        }
        if (criteria.status) {
            where.AND.push({ status: criteria.status });
        }
        if (criteria.tags) {
            where.AND.push({
                tags: {
                    some: {
                        id: {
                            in: criteria.tags,
                        },
                    },
                },
            });
        }

        const [posts, count] = await this.prisma.$transaction([
            this.prisma.post.findMany({
                where: {
                    ...where,
                },
                take: criteria.limit,
                skip: criteria.offset,
                orderBy: {
                    // newest first
                    createdDate: 'desc',
                },
                include: {
                    tags: true,
                    postedBy: true,
                    _count: {
                        select: {
                            postComments: true,
                            postReaction: true,
                        },
                    },
                    postReaction: {
                        where: {
                            createdById: ctx.user.id,
                        },
                    },
                },
            }),
            this.prisma.post.count({
                where: {
                    AND: [{ status: PostStatus.ACTIVE }],
                },
            }),
        ]);

        const mappedPost = plainToInstance(PostListingDto, posts, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });

        return {
            posts: mappedPost,
            count,
        };
    }

    async hardDeletePost(ctx: RequestContext, id: string) {
        this.logger.log(ctx, `${this.hardDeletePost.name} was called`);

        const actor: Actor = ctx.user;
        const isAllowed = this.postAclService
            .forActor(actor)
            .canDoAction(Action.Delete);
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not authorized to delete this post',
            );
        }

        const post = await this.prisma.post.findUnique({
            where: {
                id,
            },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        await this.prisma.post.delete({
            where: {
                id,
            },
        });

        this.deletePostFromFeed(ctx, post);
    }

    async getPostsForGhillie(
        ctx: RequestContext,
        ghillieId: string,
        take: number,
        cursor?: Prisma.PostWhereUniqueInput,
    ): Promise<{
        posts: Array<PostListingDto>;
        pageInfo: PageInfo;
    }> {
        this.logger.log(ctx, `${this.getPostsForGhillie.name} was called`);

        const { findManyArgs, toConnection } = parsePaginationArgs({
            first: take - 1,
            after: cursor ? cursor.id : undefined,
        });

        // reverse order chronological order from createdDate
        const posts = await this.prisma.post.findMany({
            ...findManyArgs,
            where: {
                AND: [{ status: PostStatus.ACTIVE }, { ghillieId: ghillieId }],
            },
            orderBy: {
                createdDate: 'desc',
            },
            include: {
                tags: true,
                postedBy: true,
                ghillie: true,
                _count: {
                    select: {
                        postComments: true,
                        postReaction: true,
                    },
                },
                postReaction: {
                    where: {
                        createdById: ctx.user.id,
                    },
                },
            },
        });

        if (posts.length === 0) {
            return {
                posts: [] as Array<PostListingDto>,
                pageInfo: toConnection(posts).pageInfo,
            };
        }

        const ghillieUser = await this.prisma.ghillieMembers.findFirst({
            where: {
                AND: [{ userId: ctx.user.id }, { ghillieId: ghillieId }],
            },
        });

        if (!ghillieUser) {
            throw new Error('You are not a member of this Ghillie');
        }
        if (ghillieUser.memberStatus !== MemberStatus.ACTIVE) {
            throw new Error(
                'You are not allowed to view posts in this Ghillie',
            );
        }

        return {
            posts: plainToInstance(PostListingDto, posts, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            }),
            pageInfo: toConnection(posts).pageInfo,
        };
    }

    async getPostsForCurrentUser(
        ctx: RequestContext,
        take: number,
        cursor: string,
    ) {
        this.logger.log(ctx, `${this.getPostsForCurrentUser.name} was called`);

        const { findManyArgs, toConnection, toResponse } = parsePaginationArgs({
            first: take - 1,
            after: cursor ? cursor : undefined,
        });

        const posts = await this.prisma.post.findMany({
            ...findManyArgs,
            where: {
                AND: [
                    { status: PostStatus.ACTIVE },
                    { postedById: ctx.user.id },
                ],
            },
            orderBy: {
                createdDate: 'desc',
            },
            include: {
                tags: true,
                postedBy: true,
                ghillie: true,
                _count: {
                    select: {
                        postComments: true,
                        postReaction: true,
                    },
                },
                postReaction: {
                    where: {
                        createdById: ctx.user.id,
                    },
                },
            },
        });

        if (posts.length === 0) {
            return {
                posts: [] as Array<PostListingDto>,
                pageInfo: toConnection(posts).pageInfo,
            };
        }

        return {
            posts: toResponse(
                plainToInstance(PostListingDto, posts, {
                    excludeExtraneousValues: true,
                    enableImplicitConversion: true,
                }),
            ),
            pageInfo: toConnection(posts).pageInfo,
        };
    }
}
