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
    CommentDetailDto,
    CreateCommentDto,
    RequestContext,
    sendSentryError,
    UpdateCommentDto,
} from '../../shared';
import { GetStreamService } from '../../shared/getsream/getstream.service';
import { NotificationService } from '../../notifications/services/notification.service';
import { NEST_PGPROMISE_CONNECTION } from 'nestjs-pgpromise';
import { IDatabase } from 'pg-promise';
import { CommentAclService } from './comment-acl.service';
import {
    CommentStatus,
    GhillieStatus,
    MemberStatus,
    NotificationType,
    Post,
    PostComment,
    ReactionType,
    User,
} from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { ReactionAPIResponse } from 'getstream';
import { ParentCommentDto } from '../dtos/parent-comment.dto';
import { ChildCommentDto } from '../dtos/child-comment.dto';
import Immutable from 'immutable';
import { getMilitaryString } from '../../shared';
import { PushNotificationService } from '../../push-notifications/services/push-notification.service';
import { PushNotificationType } from '../../push-notifications/dtos/push-notification-type';

@Injectable()
export class ParentCommentService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: AppLogger,
        private readonly aclService: CommentAclService,
        private readonly streamService: GetStreamService,
        private readonly notificationService: NotificationService,
        private readonly pushNotificationService: PushNotificationService,
        @Inject(NEST_PGPROMISE_CONNECTION) private readonly pg: IDatabase<any>,
    ) {
        this.logger.setContext(ParentCommentService.name);
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
            include: {
                ghillie: true,
            },
        });

        if (!ghillieMember) {
            throw new Error(
                'User is not a member of the ghillie and cannot comment on this post',
            );
        }

        // CHeck if ghillie is active
        if (ghillieMember.ghillie.status !== GhillieStatus.ACTIVE) {
            throw new Error(
                'Ghillie is not active and cannot comment on this post',
            );
        }

        const comment = await this.createParentComment(
            ctx,
            createPostCommentInput,
            ghillieMember.ghillie?.imageUrl,
        );

        await this.subscribeToPostComment(ctx, comment.postId);

        return plainToInstance(CommentDetailDto, comment, {
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

        const updatedComment = await this.prisma.postComment.update({
            where: {
                id: commentId,
            },
            data: {
                content: updatePostCommentInput.content || comment.content,
                status: updatePostCommentInput.status || comment.status,
                edited: true,
            },
            include: {
                post: true,
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
            await this.streamService.updateComment({
                reactionId: updatedComment.activityId,
                data: {
                    sourceId: updatedComment.id,
                    postOwnerId: updatedComment.post.postedById,
                    commentingUserId: updatedComment.createdById,
                    time: new Date().toISOString(),
                    commentId: updatedComment.id,
                    postId: updatedComment.postId,
                    content: updatedComment.content,
                    status: updatedComment.status,
                },
                reactionUpdateOptions: {},
            });
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

        if (
            comment.createdById !== ctx.user.id &&
            !ctx.user.authorities.includes('ROLE_ADMIN')
        ) {
            throw new Error('You are not allowed to delete this comment');
        }

        this.streamService
            .deletePostComment(comment.activityId)
            .then(() => {
                // delete from DB
                this.prisma
                    .$transaction(async (prisma) => {
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
                    })
                    .then(() => {
                        this.logger.log(
                            ctx,
                            `Post comment ${commentId} was deleted w/ children`,
                        );
                    })
                    .catch((error) => {
                        this.logger.error(
                            ctx,
                            `Error deleting post comment and children in database: ${error}`,
                        );
                    });
            })
            .catch((error) => {
                this.logger.error(
                    ctx,
                    `Failed to delete comment from feed - ${error.message}`,
                    error,
                );
            });
    }

    async getParentCommentFeed(
        ctx: RequestContext,
        postId: string,
        limit = 10,
        page = 1,
    ): Promise<ParentCommentDto[]> {
        this.logger.log(ctx, `${this.getParentCommentFeed.name} was called`);

        const actor: Actor = ctx.user;
        const isAllowed = this.aclService
            .forActor(actor)
            .canDoAction(Action.Read);
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not allowed to read comments for this post',
            );
        }

        const post: Post = await this.pg.oneOrNone(
            'SELECT * FROM post WHERE id = $1',
            postId,
        );

        if (!post) {
            throw new Error('Post does not exist');
        }

        const commentResponse = await this.streamService.getCommentsForPost(
            post.activityId,
            {
                limit: limit,
                offset: (page - 1) * limit,
                withReactionCounts: true,
                withOwnReactions: true,
                withOwnChildren: true,
            },
        );

        const resultData: ParentCommentDto[] = commentResponse.results.map(
            (comment) => {
                const latestReplies =
                    comment?.latest_children?.POST_COMMENT_REPLY?.map(
                        (childComment) =>
                            this.getLatestChildComments(
                                ctx,
                                comment.data.id,
                                childComment,
                            ),
                    ) || [];
                return {
                    id: comment.data.commentId,
                    content: comment.data.content,
                    status: comment.data.status,
                    createdDate: comment.data.time,
                    createdBy: {
                        ...comment.user.data,
                    },
                    edited: comment.data.edited || false,
                    postId: postId,
                    numberOfReactions:
                        comment?.children_counts?.POST_COMMENT_REACTION || 0,
                    commentReplyCount:
                        comment?.children_counts?.POST_COMMENT_REPLY || 0,
                    latestChildComments: latestReplies,
                } as ParentCommentDto;
            },
        );

        // get the parentComment ids
        const parentCommentIds = resultData.map((comment) => comment.id);

        // hydrate in the current user reactions for parent comments
        const currentUserParentCommentReactions =
            await this.hydrateCurrentUserReactions(ctx, parentCommentIds);

        // get the child comment ids from all the parent comments
        const childCommentIds = resultData
            .map((comment) => comment.latestChildComments)
            .flat()
            .map((comment) => comment.id);

        // hydrate in the current user reactions for child comments
        const currentUserChildCommentReactions =
            await this.hydrateCurrentUserReactions(ctx, childCommentIds);

        // Fill in the current user reactions for parent comments and child comments
        resultData.forEach((parentComment) => {
            parentComment.currentUserReaction =
                currentUserParentCommentReactions.get(parentComment.id) || null;
            parentComment.latestChildComments.forEach((childComment) => {
                childComment.currentUserReaction =
                    currentUserChildCommentReactions.get(childComment.id) ||
                    null;
            });
        });

        return resultData;
    }

    private getLatestChildComments(
        ctx: RequestContext,
        parentCommentId: string,
        streamData: any,
    ): ChildCommentDto {
        this.logger.log(ctx, `${this.getLatestChildComments.name} was called`);

        return {
            id: streamData.data.commentId,
            content: streamData.data.content,
            status: streamData.data.status,
            createdDate: streamData.data.time,
            createdBy: {
                ...streamData.user.data,
            },
            edited: streamData.data.edited || false,
            parentId: parentCommentId,
            currentUserReaction: null,
            numberOfReactions:
                streamData?.children_counts?.POST_COMMENT_REACTION || 0,
        } as ChildCommentDto;
    }

    private async hydrateCurrentUserReactions(
        ctx: RequestContext,
        commentIds: Array<string>,
    ): Promise<Immutable.Map<string, ReactionType | null>> {
        this.logger.log(
            ctx,
            `${this.hydrateCurrentUserReactions.name} was called`,
        );

        if (commentIds.length === 0) {
            return Immutable.Map();
        }

        const reactions = await this.pg.manyOrNone(
            `SELECT *
             FROM comment_reaction
             WHERE created_by_id = $1
               AND comment_id IN ($2:csv)`,
            [ctx.user.id, commentIds],
        );

        if (!reactions) {
            return Immutable.Map();
        }

        const commentReactions = reactions.map((reaction) => {
            return {
                commentId: reaction.commentId,
                reactionType: reaction.reactionType,
            };
        });

        // The key is the reaction.commentId and the value is the reaction.reactionType
        return Immutable.Map(
            commentReactions.map((reaction) => [
                reaction.commentId,
                reaction.reactionType,
            ]),
        );
    }

    private async createParentComment(
        ctx: RequestContext,
        createPostCommentInput: CreateCommentDto,
        ghillieImageUrl?: string,
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

        try {
            const user: User = await this.pg.oneOrNone(
                `SELECT *
                 FROM "user"
                 WHERE id = $1`,
                [ctx.user.id],
            );

            const notificationMessage = `${getMilitaryString(
                user.branch,
                user.serviceStatus,
            )} commented on your post`;

            const notification =
                await this.notificationService.createNotification(ctx, {
                    type: NotificationType.POST_COMMENT,
                    sourceId: comment.id,
                    fromUserId: ctx.user.id,
                    toUserId: postOwnerId,
                    message: notificationMessage,
                });

            if (postOwnerId !== ctx.user.id) {
                this.prisma.pushNotificationSettings
                    .findUnique({
                        where: {
                            userId: postOwnerId,
                        },
                    })
                    .then((settings) => {
                        if (settings?.postComments) {
                            this.pushNotificationService
                                .pushToUser(ctx, postOwnerId, {
                                    title: 'Someone commented on your post',
                                    message: notificationMessage,
                                    imageUrl: ghillieImageUrl,
                                    data: {
                                        notificationType:
                                            PushNotificationType.POST_COMMENT,
                                        activityId: comment.id,
                                        routingId: comment.postId,
                                        notificationId: notification.id,
                                    },
                                })
                                .then((res) => {
                                    if (res.failureCount > 0) {
                                        res.responses.forEach((r) => {
                                            if (r.error) {
                                                this.logger.error(
                                                    ctx,
                                                    `Error sending push notification: ${r.error.message}`,
                                                    r.error,
                                                );
                                                sendSentryError(ctx, r.error, {
                                                    commentId: comment.id,
                                                    postId: comment.postId,
                                                });
                                            }
                                        });
                                    }
                                })
                                .catch((err) => {
                                    this.logger.error(
                                        ctx,
                                        `Error sending push notification: ${err.message}`,
                                        err,
                                    );
                                    sendSentryError(ctx, err, {
                                        commentId: comment.id,
                                        postId: comment.postId,
                                    });
                                });
                        }
                    })
                    .catch((err) => {
                        this.logger.error(
                            ctx,
                            `Error getting push notification settings for user ${err}`,
                            err,
                        );
                    });
            }

            await this.syncPostParentComment(
                ctx,
                comment,
                notificationMessage,
                notification?.id,
            );
        } catch (err) {
            this.logger.warn(
                ctx,
                `Error while sending comment: ${comment.id} to stream or saving to notification table: ${err}`,
            );
        }

        return comment;
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

    async syncPostParentComment(
        ctx: RequestContext,
        comment: any,
        notificationMessage: string,
        notificationId?: string,
    ) {
        const reactionAddOptions = notificationId && {
            userId: comment.createdById,
            targetFeedsExtraData: {
                [`notification:${comment.post.postedById}`]: {
                    sourceId: comment.id,
                    type: 'POST_COMMENT',
                    from: ctx.user.id,
                    to: comment.post.postedById,
                    notificationId: notificationId,
                    message: notificationMessage,
                },
            },
        };

        try {
            const res: ReactionAPIResponse =
                await this.streamService.addPostComment({
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
                        ...reactionAddOptions,
                    },
                });

            await this.prisma.postComment.update({
                where: {
                    id: comment.id,
                },
                data: {
                    activityId: res.id,
                },
            });
        } catch (err) {
            this.logger.error(
                ctx,
                `Error while sending comment: ${comment.id} to stream rolling back: ${err}`,
            );

            await this.prisma.postComment.delete({
                where: {
                    id: comment.id,
                },
            });

            throw err;
        }
    }

    async getParentCommentById(ctx: RequestContext, id: string) {
        this.logger.log(ctx, `${this.getParentCommentById.name} was called`);

        const comment = await this.pg.oneOrNone(
            `SELECT *
             FROM post_comment
             WHERE id = $1`,
            [id],
        );

        if (!comment) {
            throw new NotFoundException(
                `Parent comment with id ${id} not found`,
            );
        }

        try {
            const foundComment = await this.streamService
                .getComment(comment.activityId)
                .then((res: any) => {
                    return {
                        id: res.data.commentId,
                        content: res.data.content,
                        status: res.data.status,
                        createdDate: res.data.time,
                        createdBy: {
                            ...res.user.data,
                        },
                        edited: res.data.edited || false,
                        postId: res.data.postId,
                        numberOfReactions:
                            res?.children_counts?.POST_COMMENT_REACTION || 0,
                        commentReplyCount:
                            res?.children_counts?.POST_COMMENT_REPLY || 0,
                    } as ParentCommentDto;
                })
                .catch((err) => {
                    this.logger.warn(
                        ctx,
                        `Error while getting comment: ${comment.id} from stream: ${err}`,
                    );
                    throw new NotFoundException(
                        `Parent comment with id ${id} not found`,
                    );
                });

            const currentUserParentCommentReactions =
                await this.hydrateCurrentUserReactions(ctx, [id]);
            foundComment.currentUserReaction =
                currentUserParentCommentReactions.get(id) || null;

            return foundComment;
        } catch (err) {
            this.logger.warn(
                ctx,
                `Error while fetching comment: ${id} from stream: ${err}`,
            );

            throw new NotFoundException(
                `Comment with id: ${id} does not exist`,
            );
        }
    }

    private async subscribeToPostComment(ctx: RequestContext, postId: string) {
        this.logger.debug(
            ctx,
            `${this.subscribeToPostComment.name} was called`,
        );
        this.prisma.pushNotificationSettings
            .findUnique({
                where: {
                    userId: ctx.user.id,
                },
            })
            .then((settings) => {
                if (settings?.postActivity) {
                    this.prisma.postSubscribedUser
                        .upsert({
                            where: {
                                userId_postId: {
                                    userId: ctx.user.id,
                                    postId: postId,
                                },
                            },
                            create: {
                                postId: postId,
                                userId: ctx.user.id,
                            },
                            update: {},
                        })
                        .catch((error) => {
                            this.logger.error(
                                ctx,
                                `Failed to subscribe to post comment - ${error.message}`,
                            );
                        });
                }
            });
    }
}
