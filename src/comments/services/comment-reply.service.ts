import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
    Action,
    Actor,
    AppLogger,
    RequestContext,
    UpdateCommentDto,
} from '../../shared';
import { CreateCommentReplyDto } from '../dtos/create-comment-reply.dto';
import { ReactionAPIResponse } from 'getstream';
import {
    CommentStatus,
    MemberStatus,
    NotificationType,
    PostComment,
    ReactionType,
    User,
} from '@prisma/client';
import { ActivityType } from '../../shared/queue/activity-type';
import { plainToInstance } from 'class-transformer';
import { QueueService } from '../../queue/services/queue.service';
import { GetStreamService } from '../../shared/getsream/getstream.service';
import { NotificationService } from '../../notifications/services/notification.service';
import { CommentAclService } from './comment-acl.service';
import { NEST_PGPROMISE_CONNECTION } from 'nestjs-pgpromise';
import { IDatabase } from 'pg-promise';
import { PrismaService } from '../../prisma/prisma.service';
import { ChildCommentDto } from '../dtos/child-comment.dto';
import Immutable from 'immutable';
import { getMilitaryString } from '../../shared/utils/military-utils';

@Injectable()
export class CommentReplyService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: AppLogger,
        private readonly aclService: CommentAclService,
        private readonly queueService: QueueService,
        private readonly streamService: GetStreamService,
        private readonly notificationService: NotificationService,
        @Inject(NEST_PGPROMISE_CONNECTION) private readonly pg: IDatabase<any>,
    ) {
        this.logger.setContext(CommentReplyService.name);
    }

    async createCommentReply(
        ctx: RequestContext,
        parentCommentId: string,
        createCommentInput: CreateCommentReplyDto,
    ): Promise<ChildCommentDto> {
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

        const parentComment: PostComment = await this.pg.oneOrNone(
            `SELECT *
             FROM post_comment
             WHERE id = $1`,
            [parentCommentId],
        );

        if (!parentComment) {
            throw new Error('Parent comment does not exist.');
        }

        const ghillieMember = await this.pg.oneOrNone(
            `SELECT *
             FROM ghillie_members
             WHERE user_id = $1
               AND member_status = $2
               AND ghillie_id = (SELECT ghillie_id
                                 FROM post
                                 WHERE id = $3)`,
            [ctx.user.id, MemberStatus.ACTIVE, parentComment.postId],
        );

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
                        commentHeight: 1,
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
            const user: User = await this.pg.oneOrNone(
                `SELECT *
                    FROM "user"
                    WHERE id = $1`,
                [ctx.user.id],
            );
            const notification =
                await this.notificationService.createNotification(ctx, {
                    type: NotificationType.POST_COMMENT,
                    sourceId: childComment.id,
                    fromUserId: ctx.user.id,
                    toUserId: parentComment.createdById,
                    message: `${getMilitaryString(
                        user.branch,
                        user.serviceStatus,
                    )} replied to your comment`,
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
        const response = plainToInstance(ChildCommentDto, childComment, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
        response.parentId = parentComment.id;
        return response;
    }

    async updatePostComment(
        ctx: RequestContext,
        commentId: string,
        updatePostCommentInput: UpdateCommentDto,
    ): Promise<ChildCommentDto> {
        this.logger.log(ctx, `${this.updatePostComment.name} was called`);

        const comment = await this.pg.oneOrNone(
            `SELECT *
             FROM post_comment
             WHERE id = $1`,
            [commentId],
        );

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
                    parentCommentId: updatedComment.id,
                    parentCommentOwnerId: updatedComment.content,
                    commentingUserId: updatedComment.createdById,
                    time: updatedComment.createdDate.toISOString(),
                    commentId: updatedComment.id,
                    content: updatedComment.content,
                    status: updatedComment.status,
                    edited: true,
                },
                reactionUpdateOptions: {},
            });
        } catch (error) {
            this.logger.error(
                ctx,
                `Error updating post comment in stream: ${error}`,
            );
        }

        const response = plainToInstance(ChildCommentDto, updatedComment, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
        response.parentId = comment.parentCommentId;
        return response;
    }

    private async syncPostChildComment(
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

        const comment = await this.pg.oneOrNone(
            `SELECT *
             FROM post_comment
             WHERE id = $1`,
            [commentId],
        );

        if (!comment) {
            throw new Error('Comment does not exist');
        }

        // Check if the request user is the owner of the comment or an admin
        if (
            ctx.user.id !== comment.createdById &&
            !ctx.user.authorities.includes('ROLE_ADMIN')
        ) {
            throw new Error('You are not allowed to delete this comment');
        }

        await this.pg.none(
            `DELETE
             FROM post_comment
             WHERE id = $1`,
            [commentId],
        );

        try {
            await this.streamService.deletePostComment(comment.activityId);
        } catch (error) {
            this.logger.error(
                ctx,
                `Failed to delete comment from feed - ${error.message}`,
            );
        }
    }

    async getChildCommentFeed(
        ctx: RequestContext,
        parentCommentId: string,
        limit: number,
        page: number,
    ): Promise<ChildCommentDto[]> {
        this.logger.log(ctx, `${this.getChildCommentFeed.name} was called`);

        const actor: Actor = ctx.user;
        const isAllowed = this.aclService
            .forActor(actor)
            .canDoAction(Action.Read);
        if (!isAllowed) {
            throw new UnauthorizedException(
                'You are not allowed to read comments in this ghillie',
            );
        }

        const parentComment = await this.pg.oneOrNone(
            `SELECT *
             FROM post_comment
             WHERE id = $1`,
            [parentCommentId],
        );

        if (!parentComment) {
            throw new Error('Parent comment does not exist');
        }

        const childComments = await this.streamService.getCommentReplies(
            parentComment.activityId,
            {
                limit: limit,
                offset: (page - 1) * limit,
                withReactionCounts: true,
                withOwnReactions: true,
                withOwnChildren: true,
            },
        );

        const resultData: ChildCommentDto[] = childComments.results.map(
            (comment) => {
                const currentUserReaction =
                    comment?.own_children?.POST_COMMENT_REACTION[0]?.user?.data;
                return {
                    id: comment.data.commentId,
                    content: comment.data.content,
                    status: comment.data.status,
                    createdDate: comment.data.time,
                    createdBy: {
                        ...comment.user.data,
                    },
                    edited: comment.data.edited || false,
                    numberOfReactions:
                        comment?.children_counts?.POST_COMMENT_REACTION || 0,
                    commentReplyCount:
                        comment?.children_counts?.POST_COMMENT_REPLY || 0,
                    parentId: parentCommentId,
                    currentUserReaction: currentUserReaction
                        ? ReactionType.THUMBS_UP
                        : undefined,
                } as ChildCommentDto;
            },
        );

        // get the ids of the comments
        const commentIds = resultData.map((comment) => comment.id);

        const currentUserParentCommentReactions =
            await this.hydrateCurrentUserReactions(ctx, commentIds);

        resultData.forEach((childComment) => {
            childComment.currentUserReaction =
                currentUserParentCommentReactions.get(childComment.id) || null;
        });

        return resultData;
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
}
