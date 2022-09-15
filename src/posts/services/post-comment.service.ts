import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {
    Action,
    Actor,
    AppLogger,
    CreateCommentDto,
    PageInfo,
    parsePaginationArgs,
    RequestContext,
    CommentDetailDto,
    UpdateCommentDto,
    CommentIdsInputDto,
} from '../../shared';
import {CommentStatus, MemberStatus} from '@prisma/client';
import {plainToInstance} from 'class-transformer';
import {PostCommentAclService} from './post-comment-acl.service';
import {QueueService} from "../../queue/services/queue.service";
import {ActivityType} from "../../shared/queue/activity-type";

@Injectable()
export class PostCommentService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: AppLogger,
        private readonly aclService: PostCommentAclService,
        private readonly queueService: QueueService,
    ) {
        this.logger.setContext(PostCommentService.name);
    }

    async createPostComment(
        ctx: RequestContext,
        createPostCommentInput: CreateCommentDto,
    ) {
        this.logger.log(ctx, `${this.createPostComment.name} was called`);

        const actor: Actor = ctx.user;
        const isAllowed = this.aclService
            .forActor(actor)
            .canDoAction(Action.Create);
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not allowed to create comments in this Ghillie',
            );
        }

        // Check if user is member of the ghillie, from which the post belongs
        const ghillieMember = await this.prisma.ghillieMembers.findFirst({
            where: {
                ghillie: {
                    posts: {
                        some: {
                            id: createPostCommentInput.postId,
                        },
                    },
                },
                userId: ctx.user.id,
                memberStatus: MemberStatus.ACTIVE,
            },
        });

        if (!ghillieMember) {
            throw new Error(
                'User is not a member of the ghillie and cannot comment on this post',
            );
        }

        let comment;
        if (createPostCommentInput.parentCommentId) {
            comment = await this.createChildComment(ctx, createPostCommentInput);
        } else {
            comment = await this.createParentComment(ctx, createPostCommentInput);
        }

        this.queueService.publishActivity(
            ctx,
            ActivityType.POST_COMMENT,
            comment
        );

        return plainToInstance(CommentDetailDto, comment, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async getTopLevelPostComments(
        ctx: RequestContext,
        postId: string,
        take: number,
        cursor?: string,
    ): Promise<{
        comments: CommentDetailDto[];
        pageInfo: PageInfo;
    }> {
        this.logger.log(ctx, `${this.getTopLevelPostComments.name} was called`);

        const actor: Actor = ctx.user;
        const isAllowed = this.aclService.forActor(actor).canDoAction(Action.Read);
        if (!isAllowed) {
            throw new UnauthorizedException('You are not allowed to view comments');
        }

        // Check if user is member of the ghillie, from which the comment belongs
        const ghillieMember = await this.prisma.ghillieMembers.findFirst({
            where: {
                ghillie: {
                    posts: {
                        some: {
                            id: postId,
                        },
                    },
                },
            },
        });

        if (!ghillieMember) {
            throw new Error(
                'User is not a member of the ghillie and cannot view comments on this post',
            );
        }

        const {findManyArgs, toConnection, toResponse} = parsePaginationArgs({
            first: take - 1,
            after: cursor ? cursor : null,
        });

        const postComments = await this.prisma.postComment.findMany({
            ...findManyArgs,
            where: {
                AND: [
                    {postId},
                    {status: CommentStatus.ACTIVE},
                    {commentHeight: 0},
                ],
            },
            orderBy: {
                // Todo: order by depth
                createdDate: 'asc',
            },
            include: {
                createdBy: true,
                _count: {
                    select: {
                        commentReaction: true,
                    },
                },
                commentReaction: {
                    where: {
                        createdById: ctx.user.id,
                    },
                },
            },
        });

        return {
            comments: plainToInstance(CommentDetailDto, toResponse(postComments), {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            }),
            pageInfo: toConnection(postComments).pageInfo,
        };
    }

    async getPostCommentsChildrenByIds(
        ctx: RequestContext,
        commentIds: CommentIdsInputDto,
    ): Promise<CommentDetailDto[]> {
        this.logger.log(
            ctx,
            `${this.getPostCommentsChildrenByIds.name} was called`,
        );

        const actor: Actor = ctx.user;
        const isAllowed = this.aclService.forActor(actor).canDoAction(Action.Read);
        if (!isAllowed) {
            throw new UnauthorizedException('You are not allowed to view comments');
        }

        const postComments = await this.prisma.postComment.findMany({
            where: {
                id: {
                    in: commentIds.commentIds,
                },
                commentHeight: commentIds.height,
            },
            include: {
                createdBy: true,
                _count: {
                    select: {
                        commentReaction: true,
                    },
                },
                commentReaction: {
                    where: {
                        createdById: ctx.user.id,
                    },
                },
            },
        });

        return plainToInstance(CommentDetailDto, postComments, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async updatePostComment(
        ctx: RequestContext,
        commentId: string,
        updatePostCommentInput: UpdateCommentDto,
    ) {
        this.logger.log(ctx, `${this.updatePostComment.name} was called`);

        const comment = await this.prisma.postComment.findFirst({
            where: {
                id: commentId,
            },
        });

        if (!comment) {
            throw new Error('Comment does not exist.');
        }

        const actor: Actor = ctx.user;
        const isAllowed = this.aclService
            .forActor(actor)
            .canDoAction(Action.Update, comment);
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not allowed to update this comment',
            );
        }

        const updatedComment = this.prisma.postComment.update({
            where: {
                id: commentId,
            },
            data: {
                content: updatePostCommentInput.content || comment.content,
                status: updatePostCommentInput.status || comment.status,
                edited: true,
            },
            include: {
                createdBy: true,
                _count: {
                    select: {
                        commentReaction: true,
                    },
                },
                commentReaction: {
                    where: {
                        createdById: ctx.user.id,
                    },
                },
            },
        });

        return plainToInstance(CommentDetailDto, updatedComment, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    private async createParentComment(
        ctx: RequestContext,
        createPostCommentInput: CreateCommentDto,
    ) {
        this.logger.log(ctx, `${this.createParentComment.name} was called`);

        return this.prisma.postComment.create({
            data: {
                content: createPostCommentInput.content,
                postId: createPostCommentInput.postId,
                createdById: ctx.user.id,
                createdDate: new Date(),
                status: CommentStatus.ACTIVE,
            },
            include: {
                commentReaction: {
                    where: {
                        createdById: ctx.user.id,
                    },
                },
            },
        });
    }

    private async createChildComment(
        ctx: RequestContext,
        createPostCommentInput: CreateCommentDto,
    ) {
        this.logger.log(ctx, `${this.createChildComment.name} was called`);

        const parentComment = await this.prisma.postComment.findFirst({
            where: {
                id: createPostCommentInput.parentCommentId,
            },
        });

        if (!parentComment) {
            throw new Error('Parent comment does not exist.');
        }

        if (parentComment.commentHeight >= 2) {
            throw new Error('Maximum comment depth reached.');
        }

        return await this.prisma.$transaction(async (prisma) => {
            // Create the child comment
            const comment = await prisma.postComment.create({
                data: {
                    content: createPostCommentInput.content,
                    postId: createPostCommentInput.postId,
                    createdById: ctx.user.id,
                    createdDate: new Date(),
                    status: CommentStatus.ACTIVE,
                    // Get the parent comment's commentHeight and add 1
                    commentHeight: parentComment.commentHeight + 1,
                },
                include: {
                    commentReaction: {
                        where: {
                            createdById: ctx.user.id,
                        },
                    },
                },
            });

            // Update the parent comment to include the child comment
            await prisma.postComment.update({
                where: {
                    id: createPostCommentInput.parentCommentId,
                },
                data: {
                    childCommentIds: {
                        push: comment.id,
                    },
                },
            });

            return comment;
        });
    }

    // delete comment and all children based on the childCommentIds
    async deletePostComment(ctx: RequestContext, commentId: string) {
        this.logger.log(ctx, `${this.deletePostComment.name} was called`);

        const actor: Actor = ctx.user;
        const isAllowed = this.aclService
            .forActor(actor)
            .canDoAction(Action.Delete);
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not allowed to delete a comment in this ghillie',
            );
        }

        const comment = await this.prisma.postComment.findFirst({
            where: {
                id: commentId,
            },
        });

        if (!comment) {
            throw new Error('Comment does not exist');
        }

        // delete all children
        await this.prisma.$transaction(async (prisma) => {
            await prisma.postComment.deleteMany({
                where: {
                    id: {
                        in: comment.childCommentIds,
                    },
                },
            });

            // delete the parent comment
            await prisma.postComment.delete({
                where: {
                    id: commentId,
                },
            });
        });
    }

    async getAllChildrenByLevel(ctx: RequestContext, id: string, level: number) {
        this.logger.log(ctx, `${this.createChildComment.name} was called`);

        const actor: Actor = ctx.user;
        const isAllowed = this.aclService.forActor(actor).canDoAction(Action.Read);
        if (!isAllowed) {
            throw new UnauthorizedException('You are not allowed to view comments');
        }

        if (level >= 2) {
            throw new Error(
                'Comment depth cannot exceed 1. Possible choices are 0-1.',
            );
        }

        const comment = await this.prisma.postComment.findUnique({
            where: {
                id: id,
            },
        });

        if (!comment) {
            return [];
        }

        const comments = await this.prisma.postComment.findMany({
            where: {
                commentHeight: level,
                id: {
                    in: comment.childCommentIds,
                },
            },
            include: {
                createdBy: true,
                _count: {
                    select: {
                        commentReaction: true,
                    },
                },
                commentReaction: {
                    where: {
                        createdById: ctx.user.id,
                    },
                },
            },
        });

        return plainToInstance(CommentDetailDto, comments, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }
}
