import {
    Inject,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
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
import {
    CommentStatus,
    MemberStatus,
    NotificationType,
    PostComment,
} from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { PostCommentAclService } from './post-comment-acl.service';
import { QueueService } from '../../queue/services/queue.service';
import { ActivityType } from '../../shared/queue/activity-type';
import { GetStreamService } from '../../shared/getsream/getstream.service';
import { NotificationService } from '../../notifications/services/notification.service';
import { ReactionAPIResponse } from 'getstream';
import { CreateCommentReplyDto } from '../dtos/create-comment-reply.dto';
import { NEST_PGPROMISE_CONNECTION } from 'nestjs-pgpromise';
import { IDatabase } from 'pg-promise';

@Injectable()
export class PostCommentService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: AppLogger,
        private readonly aclService: PostCommentAclService,
        private readonly queueService: QueueService,
        private readonly streamService: GetStreamService,
        private readonly notificationService: NotificationService,
        @Inject(NEST_PGPROMISE_CONNECTION) private readonly pg: IDatabase<any>,
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

        const comment = await this.createParentComment(
            ctx,
            createPostCommentInput,
        );

        return plainToInstance(CommentDetailDto, comment, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async createCommentReply(
        ctx: RequestContext,
        parentCommentId: string,
        createCommentInput: CreateCommentReplyDto,
    ) {
        this.logger.log(ctx, `${this.createCommentReply.name} was called`);

        const actor: Actor = ctx.user;
        const isAllowed = this.aclService
            .forActor(actor)
            .canDoAction(Action.Create);
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not allowed to create comments in this Ghillie',
            );
        }

        const parentComment = await this.prisma.postComment.findFirst({
            where: {
                id: parentCommentId,
            },
        });

        if (!parentComment) {
            throw new Error('Parent comment does not exist.');
        }

        // Check if user is member of the ghillie, from which the post belongs
        const ghillieMember = await this.prisma.ghillieMembers.findFirst({
            where: {
                ghillie: {
                    posts: {
                        some: {
                            id: parentComment.postId,
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

        if (parentComment.commentHeight >= 1) {
            throw new Error('Maximum comment depth reached.');
        }

        const childComment: PostComment = await this.prisma.$transaction(
            async (prisma) => {
                // Create the child comment
                const comment = await prisma.postComment.create({
                    data: {
                        content: createCommentInput.content,
                        postId: parentComment.postId,
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
                        post: {
                            include: {
                                postedBy: true,
                            },
                        },
                    },
                });

                // Update the parent comment to include the child comment
                await prisma.postComment.update({
                    where: {
                        id: parentCommentId,
                    },
                    data: {
                        childCommentIds: {
                            push: comment.id,
                        },
                    },
                });

                return comment;
            },
        );

        this.queueService.publishActivity(
            ctx,
            ActivityType.POST_COMMENT_REPLY,
            childComment,
            `comment-reply-${parentComment.id}`,
            parentComment.createdById,
        );

        try {
            const notification =
                await this.notificationService.createNotification(ctx, {
                    type: NotificationType.POST_COMMENT,
                    sourceId: childComment.id,
                    fromUserId: ctx.user.id,
                    toUserId: parentComment.createdById,
                    message: `${ctx.user.username} replied to your comment`,
                });

            try {
                await this.syncPostChildComment(
                    ctx,
                    parentComment,
                    childComment,
                    notification?.id,
                );
            } catch (err) {
                this.logger.warn(
                    ctx,
                    `Error while sending child comment: ${childComment.id} to stream: ${err}`,
                );
            }
        } catch (error) {
            this.logger.error(
                ctx,
                `Error while creating comment reply notification: ${error}`,
            );
        }
        return plainToInstance(CommentDetailDto, childComment, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async syncPostParentComment(
        ctx: RequestContext,
        comment: any,
        notificationId: string,
    ) {
        await this.streamService
            .addPostComment({
                kind: 'POST_COMMENT',
                // The ID of the activity (post) the reaction refers to
                postActivityId: comment.post.activityId,
                data: {
                    sourceId: comment.id,
                    postOwnerId: comment.post.postedById,
                    commentingUserId: comment.createdById,
                    time: new Date().toISOString(),
                    commentId: comment.id,
                    reactionCount: 0,
                    postId: comment.postId,
                    content: comment.content,
                    status: comment.status,
                },
                reactionAddOptions: {
                    userId: comment.createdById,
                    targetFeedsExtraData: {
                        [`notification:${comment.post.postedById}`]: {
                            sourceId: comment.id,
                            type: 'POST_COMMENT',
                            from: ctx.user.id,
                            to: comment.post.postedById,
                            notificationId: notificationId,
                        },
                    },
                },
            })
            .then(async (res: ReactionAPIResponse) => {
                await this.prisma.postComment.update({
                    where: {
                        id: comment.id,
                    },
                    data: {
                        activityId: res.id,
                    },
                });
            });
    }

    async syncPostChildComment(
        ctx: RequestContext,
        parentComment: any,
        childComment: any,
        notificationId?: string,
    ) {
        this.logger.log(ctx, `${this.syncPostChildComment.name} was called`);
        const reactionAddOptions = notificationId && {
            targetFeeds: [`notification:${parentComment.createdById}`],
            targetFeedsExtraData: {
                [`notification:${parentComment.createdById}`]: {
                    sourceId: childComment.id,
                    type: 'POST_COMMENT',
                    from: ctx.user.id,
                    to: parentComment.createdById,
                    notificationId: notificationId,
                },
            },
        };

        this.streamService
            .createChildPostComment({
                parentCommentReactionId: parentComment.activityId,
                kind: 'POST_COMMENT_REPLY',
                data: {
                    parentCommentId: childComment.id,
                    parentCommentOwnerId: childComment.content,
                    commentingUserId: childComment.createdById,
                    time: childComment.createdDate.toISOString(),
                    commentId: childComment.id,
                    content: childComment.content,
                    status: childComment.status,
                    edited: false,
                },
                reactionAddOptions: {
                    userId: childComment.createdById,
                    ...reactionAddOptions,
                },
            })
            .then(async (res: ReactionAPIResponse) => {
                await this.prisma.postComment.update({
                    where: {
                        id: childComment.id,
                    },
                    data: {
                        activityId: res.id,
                    },
                });
            });
    }

    async getPostOwnerId(ctx: RequestContext, postId: string): Promise<string> {
        const post = await this.prisma.post.findFirst({
            where: {
                id: postId,
            },
            include: {
                postedBy: true,
            },
        });

        return post.postedBy.id;
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
        const isAllowed = this.aclService
            .forActor(actor)
            .canDoAction(Action.Read);
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not allowed to view comments',
            );
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

        const { findManyArgs, toConnection, toResponse } = parsePaginationArgs({
            first: take - 1,
            after: cursor ? cursor : null,
        });

        const postComments = await this.prisma.postComment.findMany({
            ...findManyArgs,
            where: {
                AND: [
                    { postId },
                    { status: CommentStatus.ACTIVE },
                    { commentHeight: 0 },
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
            comments: plainToInstance(
                CommentDetailDto,
                toResponse(postComments),
                {
                    excludeExtraneousValues: true,
                    enableImplicitConversion: true,
                },
            ),
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
        const isAllowed = this.aclService
            .forActor(actor)
            .canDoAction(Action.Read);
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not allowed to view comments',
            );
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

        try {
            await this.streamService.updatePostComment(
                comment.activityId,
                updatePostCommentInput.content,
                updatePostCommentInput.status,
            );
        } catch (error) {
            this.logger.error(
                ctx,
                `Error updating post comment in stream: ${error}`,
            );
        }

        return plainToInstance(CommentDetailDto, updatedComment, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    private async createParentComment(
        ctx: RequestContext,
        createPostCommentInput: CreateCommentDto,
    ): Promise<PostComment> {
        this.logger.log(ctx, `${this.createParentComment.name} was called`);

        const comment = await this.prisma.postComment.create({
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
                post: {
                    include: {
                        postedBy: true,
                    },
                },
            },
        });

        // Send notification to post owner
        const postOwnerId = await this.getPostOwnerId(
            ctx,
            createPostCommentInput.postId,
        );
        this.queueService.publishActivity(
            ctx,
            ActivityType.POST_COMMENT,
            comment,
            undefined,
            postOwnerId,
        );

        try {
            const notification =
                await this.notificationService.createNotification(ctx, {
                    type: NotificationType.POST_COMMENT,
                    sourceId: comment.id,
                    fromUserId: ctx.user.id,
                    toUserId: postOwnerId,
                    message: `${ctx.user.username} commented on your post`,
                });
            await this.syncPostParentComment(ctx, comment, notification.id);
        } catch (err) {
            this.logger.warn(
                ctx,
                `Error while sending comment: ${comment.id} to stream or saving to notification table: ${err}`,
            );
        }

        return comment;
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

        try {
            await this.streamService.deletePostComment(comment.activityId);
        } catch (error) {
            this.logger.error(
                ctx,
                `Failed to delete comment from feed - ${error.message}`,
            );
        }
    }

    async getPostCommentReplies(
        ctx: RequestContext,
        parentCommentId: string,
        page = 1,
        perPage = 25,
    ) {
        this.logger.log(ctx, `${this.getPostCommentReplies.name} was called`);

        const actor: Actor = ctx.user;
        const isAllowed = this.aclService
            .forActor(actor)
            .canDoAction(Action.Read);
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not allowed to view comments',
            );
        }

        const parentComment: PostComment = await this.pg.one(
            'SELECT * FROM post_comment WHERE id = $1',
            [parentCommentId],
        );

        if (!parentComment) {
            throw new NotFoundException('Parent comment does not exist');
        }

        const commentResponse = await this.streamService.getCommentReplies(
            parentComment.activityId,
            {
                limit: perPage,
                offset: (page - 1) * perPage,
                withReactionCounts: true,
                withOwnReactions: true,
            },
        );

        const resultData = commentResponse.results.map((comment) => ({
            ...comment,
        }));

        return resultData.map(
            (comment) =>
                ({
                    id: comment.data.id,
                    content: comment.data.content,
                    status: comment.data.status,
                    createdDate: comment.data.time,
                    createdBy: {
                        ...comment.user.data,
                    },
                    edited: comment.data.edited || false,
                    postId: parentComment.postId,
                } as CommentDetailDto),
        );
    }
}
