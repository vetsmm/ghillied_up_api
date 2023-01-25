import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    AppLogger,
    PageInfo,
    parsePaginationArgs,
    RequestContext,
    PostReactionSubsetDto,
    PostReactionDetailsDto,
    PostReactionInputDto,
    PostDetailDto,
    sendSentryError,
} from '../../shared';
import { PostAclService } from './post-acl.service';
import {
    MemberStatus,
    NotificationType,
    PostReaction,
    User,
} from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { PostService } from './post.service';
import { QueueService } from '../../sns/services/queue.service';
import { GetStreamService } from '../../shared/getsream/getstream.service';
import { NotificationService } from '../../notifications/services/notification.service';
import { getMilitaryString } from '../../shared';
import { NEST_PGPROMISE_CONNECTION } from 'nestjs-pgpromise';
import { IDatabase } from 'pg-promise';
import { PushNotificationService } from '../../push-notifications/services/push-notification.service';
import { PushNotificationType } from '../../push-notifications/dtos/push-notification-type';

@Injectable()
export class PostReactionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: AppLogger,
        private readonly postAclService: PostAclService,
        private readonly postService: PostService,
        private readonly queueService: QueueService,
        private readonly streamService: GetStreamService,
        private readonly notificationService: NotificationService,
        private readonly pushService: PushNotificationService,
        @Inject(NEST_PGPROMISE_CONNECTION) private readonly pg: IDatabase<any>,
    ) {
        this.logger.setContext(PostReactionService.name);
    }

    async reactToPost(
        ctx: RequestContext,
        reactionInput: PostReactionInputDto,
    ): Promise<PostDetailDto> {
        this.logger.log(ctx, `${this.reactToPost.name} was called`);

        // get the post
        const post = await this.prisma.post.findUnique({
            where: {
                id: reactionInput.postId,
            },
        });

        if (!post) {
            throw new Error(
                `The post with id ${reactionInput.postId} does not exist. Please enter the correct post id.`,
            );
        }

        // check if the user has access to the ghillie for the post
        const member = await this.prisma.ghillieMembers.findFirst({
            where: {
                ghillieId: post.ghillieId,
                userId: ctx.user.id,
                memberStatus: MemberStatus.ACTIVE,
            },
            include: {
                ghillie: true,
            },
        });

        if (!member) {
            throw new Error(`You do not have access to to react to this post.`);
        }

        // Update the post with the new reaction if exists, if not create, if reaction is null, then delete
        if (reactionInput.reactionType) {
            const reaction = await this.prisma.postReaction.upsert({
                where: {
                    createdById_postId: {
                        postId: reactionInput.postId,
                        createdById: ctx.user.id,
                    },
                },
                create: {
                    postId: reactionInput.postId,
                    createdById: ctx.user.id,
                    reactionType: reactionInput.reactionType,
                },
                update: {
                    reactionType: reactionInput.reactionType,
                },
                include: {
                    post: {
                        include: {
                            postedBy: true,
                        },
                    },
                },
            });

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
                )} reacted to your post`;

                const notification =
                    await this.notificationService.createNotification(ctx, {
                        type: NotificationType.POST_COMMENT,
                        sourceId: reaction.id,
                        fromUserId: ctx.user.id,
                        toUserId: post.postedById,
                        message: notificationMessage,
                    });

                if (post.postedById !== ctx.user.id) {
                    this.prisma.pushNotificationSettings
                        .findUnique({
                            where: {
                                userId: post.postedById,
                            },
                        })
                        .then((settings) => {
                            if (settings?.postReactions) {
                                this.pushService
                                    .pushToUser(
                                        ctx,
                                        post.postedById,
                                        {
                                            title: 'Someone reacted to your post',
                                            message: notificationMessage,
                                            imageUrl: member.ghillie.imageUrl,
                                            data: {
                                                notificationType:
                                                    PushNotificationType.POST_REACTION,
                                                activityId: reaction.id,
                                                routingId: reaction.post.id,
                                                reactionType:
                                                    reaction.reactionType,
                                                notificationId: notification.id,
                                            },
                                        },
                                        false,
                                    )
                                    .then((res) => {
                                        if (res.failureCount > 0) {
                                            res.responses.forEach((r) => {
                                                if (r.error) {
                                                    this.logger.error(
                                                        ctx,
                                                        `Error sending push notification: ${r.error.message}`,
                                                        r.error,
                                                    );
                                                    sendSentryError(
                                                        ctx,
                                                        r.error,
                                                        {
                                                            postId: post.id,
                                                            reactionId:
                                                                reaction.id,
                                                        },
                                                    );
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
                                            postId: post.id,
                                            reactionId: reaction.id,
                                        });
                                    });
                            }
                        })
                        .catch((err) => {
                            this.logger.error(
                                ctx,
                                `Error getting push notification settings for user ${post.postedById}`,
                                err,
                            );
                        });
                }

                this.syncPostReaction(
                    ctx,
                    post,
                    reaction,
                    notificationMessage,
                    notification.id,
                );
            } catch (e) {
                this.logger.warn(ctx, '');
            }
        } else {
            // check if the user has reacted to the post
            const reaction = await this.prisma.postReaction.findFirst({
                where: {
                    postId: reactionInput.postId,
                    createdById: ctx.user.id,
                },
            });

            if (!reaction) {
                return;
            }

            await this.prisma.postReaction.delete({
                where: {
                    createdById_postId: {
                        postId: reactionInput.postId,
                        createdById: ctx.user.id,
                    },
                },
            });

            await this.streamService
                .deletePostReaction(reaction.activityId)
                .catch((e) => {
                    this.logger.warn(
                        ctx,
                        `Error deleting reaction from stream: ${e}`,
                    );
                });
        }

        return this.postService.getPostById(ctx, reactionInput.postId);
    }

    syncPostReaction(
        ctx: RequestContext,
        post: any,
        reaction: PostReaction,
        notificationMessage: string,
        notificationId: string,
    ): void {
        if (reaction.activityId) {
            this.streamService
                .updatePostReaction(reaction.activityId, reaction.reactionType)
                .catch((e) => {
                    this.logger.warn(
                        ctx,
                        `Error updating reaction in stream: ${e}`,
                    );
                });
            return;
        }
        this.streamService
            .addPostReaction({
                kind: 'POST_REACTION',
                postActivityId: post.activityId,
                data: {
                    sourceId: reaction.id,
                    postOwnerId: post.postedById,
                    reactingUserId: reaction.createdById,
                    time: new Date().toISOString(),
                    postId: post.id,
                    reactionId: reaction.id,
                    reactionType: reaction.reactionType,
                },
                reactionAddOptions: {
                    userId: reaction.createdById,
                    targetFeedsExtraData: {
                        [`notification:${post.postedById}`]: {
                            sourceId: reaction.id,
                            type: 'POST_REACTION',
                            from: ctx.user.id,
                            to: post.postedById,
                            notificationId: notificationId,
                            message: notificationMessage,
                        },
                    },
                },
            })
            .then(async (res) => {
                this.logger.log(
                    ctx,
                    `Added reaction: ${reaction.id} to stream`,
                );
                await this.prisma.postReaction.update({
                    where: {
                        id: reaction.id,
                    },
                    data: {
                        activityId: res.activity_id,
                    },
                });
            })
            .catch((err) => {
                this.logger.error(
                    ctx,
                    `Error adding reaction: ${reaction.id} to stream: ${err}`,
                );
            });
    }

    async getAllPostReactions(
        ctx: RequestContext,
        postId: string,
        cursor?: string,
        take = 25,
    ): Promise<{
        reactions: PostReactionDetailsDto[];
        pageInfo: PageInfo;
    }> {
        this.logger.log(ctx, `${this.getAllPostReactions.name} was called`);

        const { findManyArgs, toConnection } = parsePaginationArgs({
            first: take - 1,
            after: cursor ? cursor : undefined,
        });

        // get the reactions for the post
        const reactions = await this.prisma.postReaction.findMany({
            ...findManyArgs,
            where: {
                postId: postId,
            },
            include: {
                post: true,
            },
        });

        if (reactions.length === 0) {
            return {
                reactions: [] as Array<PostReactionDetailsDto>,
                pageInfo: toConnection(reactions).pageInfo,
            };
        }

        return {
            reactions: plainToInstance(PostReactionDetailsDto, reactions, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            }),
            pageInfo: toConnection(reactions).pageInfo,
        };
    }

    async getCurrentUserReactions(
        ctx: RequestContext,
        postId: string,
        cursor?: string,
        take = 25,
    ): Promise<{
        reactions: PostReactionDetailsDto[];
        pageInfo: PageInfo;
    }> {
        this.logger.log(ctx, `${this.getCurrentUserReactions.name} was called`);

        const { findManyArgs, toConnection } = parsePaginationArgs({
            first: take - 1,
            after: cursor ? cursor : undefined,
        });

        // get the reactions for the post
        const reactions = await this.prisma.postReaction.findMany({
            ...findManyArgs,
            where: {
                postId: postId,
                createdById: ctx.user.id,
            },
            include: {
                post: {
                    include: {
                        ghillie: true,
                        postedBy: true,
                    },
                },
            },
        });

        if (reactions.length === 0) {
            return {
                reactions: [] as Array<PostReactionDetailsDto>,
                pageInfo: toConnection(reactions).pageInfo,
            };
        }

        return {
            reactions: plainToInstance(PostReactionDetailsDto, reactions, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            }),
            pageInfo: toConnection(reactions).pageInfo,
        };
    }

    async getPostReactionsCount(
        ctx: RequestContext,
        postId: string,
    ): Promise<PostReactionSubsetDto> {
        this.logger.log(ctx, `${this.getCurrentUserReactions.name} was called`);

        // get the post
        const post = await this.prisma.post.findUnique({
            where: {
                id: postId,
            },
            include: {
                ghillie: true,
                postedBy: true,
            },
        });

        if (!post) {
            throw new Error(
                `The post with id ${postId} does not exist. Please enter the correct post id.`,
            );
        }

        // Get the counts for all the different reactionTypes for a post
        const reactionCounts = await this.prisma.postReaction.groupBy({
            by: ['reactionType'],
            where: {
                postId: postId,
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
            postId: post.id,
            post: plainToInstance(PostDetailDto, post, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            }),
        } as unknown as PostReactionSubsetDto;
    }
}
