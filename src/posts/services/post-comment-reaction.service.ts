import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    AppLogger,
    PageInfo,
    parsePaginationArgs,
    RequestContext,
    CommentReactionInputDto,
    CommentReactionDetailsDto,
    CommentReactionSubsetDto,
} from '../../shared';
import {
    CommentReaction,
    MemberStatus,
    NotificationType,
} from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { QueueService } from '../../queue/services/queue.service';
import { ActivityType } from '../../shared/queue/activity-type';
import { GetStreamService } from '../../shared/getsream/getstream.service';
import { NotificationService } from '../../notifications/services/notification.service';

@Injectable()
export class PostCommentReactionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: AppLogger,
        private readonly queueService: QueueService,
        private readonly streamService: GetStreamService,
        private readonly notificationService: NotificationService,
    ) {
        this.logger.setContext(PostCommentReactionService.name);
    }

    async reactToComment(
        ctx: RequestContext,
        commentReactionDto: CommentReactionInputDto,
    ): Promise<void> {
        this.logger.log(ctx, `${this.reactToComment.name} was called`);

        // get the post
        const comment = await this.prisma.postComment.findUnique({
            where: {
                id: commentReactionDto.commentId,
            },
            include: {
                post: {
                    include: {
                        ghillie: true,
                    },
                },
            },
        });

        if (!comment) {
            throw new Error(
                `The comment with id ${commentReactionDto.commentId} does not exist. Please enter the correct comment id.`,
            );
        }

        // check if the user has access to the ghillie for the post
        const member = await this.prisma.ghillieMembers.findFirst({
            where: {
                ghillieId: comment.post.ghillieId,
                userId: ctx.user.id,
                memberStatus: MemberStatus.ACTIVE,
            },
        });

        if (!member) {
            throw new Error(
                `You do not have access to to react to this comment.`,
            );
        }

        // Update the post with the new reaction if exists, if not create, if reaction is null, then delete
        if (commentReactionDto.reactionType) {
            const cr = await this.prisma.commentReaction.upsert({
                where: {
                    createdById_commentId: {
                        commentId: commentReactionDto.commentId,
                        createdById: ctx.user.id,
                    },
                },
                create: {
                    commentId: commentReactionDto.commentId,
                    createdById: ctx.user.id,
                    reactionType: commentReactionDto.reactionType,
                },
                update: {
                    reactionType: commentReactionDto.reactionType,
                },
                include: {
                    postComment: {
                        include: {
                            createdBy: true,
                            post: true,
                        },
                    },
                },
            });
            this.queueService.publishActivity<CommentReaction>(
                ctx,
                ActivityType.POST_COMMENT_REACTION,
                cr,
                undefined,
                cr.postComment.createdBy.id,
            );
            try {
                const notification =
                    await this.notificationService.createNotification(ctx, {
                        type: NotificationType.POST_COMMENT,
                        sourceId: cr.id,
                        fromUserId: ctx.user.id,
                        toUserId: comment.createdById,
                        message: `${ctx.user.username} reacted to your comment`,
                    });
                await this.syncPostCommentReaction(
                    ctx,
                    cr,
                    comment,
                    notification.id,
                );
            } catch (err) {
                this.logger.warn(
                    ctx,
                    `Error adding reaction to stream or notification table: ${err}`,
                );
            }
        } else {
            // check if the user has reacted to the comment
            const reaction = await this.prisma.commentReaction.findFirst({
                where: {
                    commentId: commentReactionDto.commentId,
                    createdById: ctx.user.id,
                },
            });

            if (!reaction) {
                return;
            }

            await this.prisma.commentReaction.delete({
                where: {
                    createdById_commentId: {
                        commentId: commentReactionDto.commentId,
                        createdById: ctx.user.id,
                    },
                },
            });

            try {
                await this.streamService.deletePostCommentReaction(
                    reaction.activityId,
                );
            } catch (err) {
                this.logger.warn(
                    ctx,
                    `Error deleting reaction from stream: ${err}`,
                );
            }
        }
    }

    async syncPostCommentReaction(
        ctx: RequestContext,
        cr: CommentReaction,
        comment: any,
        notificationId: string,
    ): Promise<void> {
        // If there is already an activityId, then lets just update the activity
        if (cr.activityId) {
            await this.streamService.updatePostCommentReaction(
                cr.activityId,
                cr.reactionType,
            );
            return;
        }
        this.streamService
            .addPostCommentReaction({
                kind: 'POST_COMMENT_REACTION',
                commentActivityId: comment.activityId,
                data: {
                    sourceId: cr.id,
                    commentId: comment.id,
                    reactionId: cr.id,
                    commentOwnerId: comment.createdById,
                    reactingUserId: cr.createdById,
                    time: new Date().toISOString(),
                    postId: comment.postId,
                    reactionType: cr.reactionType,
                },
                reactionAddOptions: {
                    userId: cr.createdById,
                    targetFeedsExtraData: {
                        [`notification:${comment.createdById}`]: {
                            sourceId: cr.id,
                            type: 'POST_COMMENT_REACTION',
                            from: ctx.user.id,
                            to: comment.createdById,
                            notificationId,
                        },
                    },
                },
            })
            .then(async (res) => {
                this.logger.log(ctx, `Added reaction: ${cr.id} to stream`);
                await this.prisma.commentReaction.update({
                    where: {
                        id: cr.id,
                    },
                    data: {
                        activityId: res.id,
                    },
                });
            })
            .catch((err) => {
                this.logger.error(
                    ctx,
                    `Error adding reaction: ${cr.id} to stream: ${err}`,
                );
            });
    }

    async getAllCommentReactions(
        ctx: RequestContext,
        commentId: string,
        cursor?: string,
        take = 25,
    ): Promise<{
        reactions: CommentReactionDetailsDto[];
        pageInfo: PageInfo;
    }> {
        this.logger.log(ctx, `${this.getAllCommentReactions.name} was called`);

        const { findManyArgs, toConnection, toResponse } = parsePaginationArgs({
            first: take - 1,
            after: cursor ? cursor : undefined,
        });

        // get the reactions for the post
        const reactions = await this.prisma.commentReaction.findMany({
            ...findManyArgs,
            where: {
                commentId: commentId,
            },
            include: {
                postComment: {
                    include: {
                        post: {
                            include: {
                                ghillie: true,
                                postedBy: true,
                            },
                        },
                    },
                },
            },
        });

        if (reactions.length === 0) {
            return {
                reactions: [] as Array<CommentReactionDetailsDto>,
                pageInfo: toConnection(reactions).pageInfo,
            };
        }

        return {
            reactions: plainToInstance(
                CommentReactionDetailsDto,
                toResponse(reactions),
                {
                    excludeExtraneousValues: true,
                    enableImplicitConversion: true,
                },
            ),
            pageInfo: toConnection(reactions).pageInfo,
        };
    }

    async getCurrentUserReactions(
        ctx: RequestContext,
        commentId: string,
        cursor?: string,
        take = 25,
    ): Promise<{
        reactions: CommentReactionDetailsDto[];
        pageInfo: PageInfo;
    }> {
        this.logger.log(ctx, `${this.getCurrentUserReactions.name} was called`);

        const { findManyArgs, toConnection } = parsePaginationArgs({
            first: take - 1,
            after: cursor ? cursor : undefined,
        });

        // get the reactions for the post
        const reactions = await this.prisma.commentReaction.findMany({
            ...findManyArgs,
            where: {
                commentId: commentId,
                createdById: ctx.user.id,
            },
            include: {
                postComment: {
                    include: {
                        post: {
                            include: {
                                ghillie: true,
                                postedBy: true,
                            },
                        },
                    },
                },
            },
        });

        if (reactions.length === 0) {
            return {
                reactions: [] as Array<CommentReactionDetailsDto>,
                pageInfo: toConnection(reactions).pageInfo,
            };
        }

        return {
            reactions: plainToInstance(CommentReactionDetailsDto, reactions, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            }),
            pageInfo: toConnection(reactions).pageInfo,
        };
    }

    async getCommentReactionsCount(
        ctx: RequestContext,
        commentId: string,
    ): Promise<CommentReactionSubsetDto> {
        this.logger.log(ctx, `${this.getCurrentUserReactions.name} was called`);

        // get the post
        const comment = await this.prisma.postComment.findUnique({
            where: {
                id: commentId,
            },
            include: {
                post: {
                    include: {
                        ghillie: true,
                    },
                },
            },
        });

        if (!comment) {
            throw new Error(
                `The comment with id ${commentId} does not exist. Please enter the correct comment id.`,
            );
        }

        // Get the counts for all the different reactionTypes for a post
        const reactionCounts = await this.prisma.commentReaction.groupBy({
            by: ['reactionType'],
            where: {
                commentId: commentId,
            },
            _count: true,
        });

        // get total count of reactions for the post based on the aggregation
        const totalReactions = reactionCounts
            .map((reaction) => reaction._count)
            .reduce((a, b) => a + b, 0);
        const reactions = reactionCounts.map((reaction) => {
            return { [reaction.reactionType]: reaction._count };
        });

        return {
            totalReactions,
            reactions,
            commentId: commentId,
            post: plainToInstance(CommentReactionSubsetDto, comment, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            }),
        } as unknown as CommentReactionSubsetDto;
    }
}
