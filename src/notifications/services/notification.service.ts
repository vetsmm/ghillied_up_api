import {
    Inject,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { AppLogger, RequestContext } from '../../shared';
import {
    PostCommentNotificationDto,
    PostCommentReactionNotificationDto,
    PostReactionNotificationDto,
} from '../dtos/notification.dto';
import { UnreadNotificationsDto } from '../dtos/unread-notifications.dto';
import { NEST_PGPROMISE_CONNECTION } from 'nestjs-pgpromise';
import { IDatabase } from 'pg-promise';
import Immutable from 'immutable';
import { NotificationType, Notification } from '@prisma/client';
import { GetStreamService } from '../../shared/getsream/getstream.service';
import { NotificationActivity } from 'getstream';
import * as cuid from 'cuid';
import { ReadNotificationsInputDto } from '../dtos/read-notifications-input.dto';

@Injectable()
export class NotificationService {
    constructor(
        private readonly logger: AppLogger,
        private readonly streamService: GetStreamService,
        @Inject(NEST_PGPROMISE_CONNECTION) private readonly pg: IDatabase<any>,
    ) {
        this.logger.setContext(NotificationService.name);
    }

    async getNotificationFeed(ctx: RequestContext, page = 1, perPage = 25) {
        this.logger.log(ctx, `${this.getNotificationFeed.name} was called`);
        const { user } = ctx;
        const feed = await this.streamService.getNotificationFeed(user.id, {
            limit: perPage,
            offset: (page - 1) * perPage,
        });
        return this.hydrateNotifications(
            ctx,
            feed.results as NotificationActivity[],
        );
    }

    private async hydrateNotifications(
        ctx: RequestContext,
        notificationActivities: NotificationActivity[],
    ): Promise<any[]> {
        this.logger.log(ctx, `${this.hydrateNotifications.name} was called`);

        const activityNotifications: {
            type: NotificationType;
            sourceId: string;
            to: string;
            from: string;
            activityId: string;
            notificationId: string;
            read: boolean;
        }[] = [];

        const notificationsByType = Immutable.Map<
            NotificationType,
            string[]
        >().withMutations((map) => {
            const outerActivities = [];
            notificationActivities.forEach((activity) => {
                const { activities, is_read, id } = activity;
                return outerActivities.push(
                    ...activities.map((a) => ({
                        ...a,
                        is_read,
                        activityId: id,
                    })),
                );
            });

            outerActivities.forEach((innerActivity) => {
                try {
                    const notificationDetails: any =
                        innerActivity[`notification:${ctx.user.id}`];
                    if (notificationDetails) {
                        if (notificationDetails.from === ctx.user.id) {
                            // ignore if we sent to ourselves
                            return;
                        }
                        const ids = map.get(notificationDetails.type) || [];
                        ids.push(notificationDetails.sourceId);
                        map.set(notificationDetails.type, ids);
                        activityNotifications.push({
                            type: notificationDetails.type,
                            sourceId: notificationDetails.sourceId,
                            to: notificationDetails.to,
                            from: notificationDetails.from,
                            notificationId: notificationDetails.notificationId,
                            activityId: innerActivity.activityId,
                            read: innerActivity.is_read,
                        });
                    }
                } catch (e) {
                    this.logger.warn(ctx, `Unable to parse notification: ${e}`);
                }
            });
        });

        return this.pg
            .task(async (t) => {
                const reactionIds =
                    notificationsByType.get(NotificationType.POST_REACTION) ||
                    [];
                const commentIds =
                    notificationsByType.get(NotificationType.POST_COMMENT) ||
                    [];
                const commentReactionIds =
                    notificationsByType.get(
                        NotificationType.POST_COMMENT_REACTION,
                    ) || [];

                const postCommentsHydrated =
                    commentIds.length > 0
                        ? t.query(
                              'SELECT pc.id as "sourceId", pc."createdDate", pc.content as "commentContent", u.username, g.id as "ghillieId", g.name as "ghillieName", g."imageUrl" as "ghillieImageUrl",p.id as "postId" FROM "PostComment" pc JOIN "User" u ON pc."createdById" = u.id JOIN "Post" p ON pc."postId" = p.id JOIN "Ghillie" g on g.id = p."ghillieId"WHERE pc.id IN ($1:list)',
                              [commentIds],
                          )
                        : [];
                const postCommentReactionsHydrated =
                    commentReactionIds.length > 0
                        ? t.query(
                              'SELECT cr.id as "sourceId", cr."createdDate", cr."reactionType", u.username, g.id as "ghillieId", g.name as "ghillieName", g."imageUrl" as "ghillieImageUrl", p.id as "postId" FROM "CommentReaction" cr JOIN "User" u ON cr."createdById" = u.id JOIN "PostComment" pc ON cr."commentId" = pc.id JOIN "Post" p ON pc."postId" = p.id JOIN "Ghillie" g on g.id = p."ghillieId" WHERE cr.id IN ($1:list)',
                              [commentReactionIds],
                          )
                        : [];
                const postReactionsHydrated =
                    reactionIds.length > 0
                        ? t.query(
                              'SELECT pr.id as "sourceId", pr."createdDate", pr."reactionType", u.username, g.id as "ghillieId", g.name as "ghillieName", g."imageUrl" as "ghillieImageUrl", p.id as "postId" FROM "PostReaction" pr JOIN "User" u ON pr."createdById" = u.id JOIN "Post" p ON pr."postId" = p.id JOIN "Ghillie" g on g.id = p."ghillieId" WHERE pr.id IN ($1:list)',
                              [reactionIds],
                          )
                        : [];

                return [
                    ...(await postCommentReactionsHydrated),
                    ...(await postCommentsHydrated),
                    ...(await postReactionsHydrated),
                ];
            })
            .then((data) => {
                return data.map((hydratedData) => {
                    const notification = activityNotifications.find(
                        (d) => d.sourceId === hydratedData.sourceId,
                    );
                    if (notification) {
                        switch (notification.type) {
                            case NotificationType.POST_COMMENT:
                                return {
                                    ...notification,
                                    ...hydratedData,
                                } as PostCommentNotificationDto;
                            case NotificationType.POST_COMMENT_REACTION:
                                return {
                                    ...notification,
                                    ...hydratedData,
                                } as PostCommentReactionNotificationDto;
                            case NotificationType.POST_REACTION:
                                return {
                                    ...notification,
                                    ...hydratedData,
                                } as PostReactionNotificationDto;
                            default:
                                return notification;
                        }
                    }
                    return hydratedData;
                });
            })
            .catch((err) => {
                this.logger.error(ctx, `Error hydrating notifications: ${err}`);
                throw new InternalServerErrorException(
                    'Error retrieving notifications',
                );
            });
    }

    async markAllNotificationsAsRead(ctx: RequestContext): Promise<void> {
        this.logger.log(
            ctx,
            `${this.markAllNotificationsAsRead.name} was called`,
        );

        await this.pg.none(
            'UPDATE "Notification" SET "read" = true, "updatedDate" = $1 WHERE "toUserId" = $2 AND "read" = false AND "trash" = false',
            [new Date(), ctx.user.id],
        );

        await this.streamService.markAllAsRead(ctx.user.id);
    }

    markNotificationsAsRead(
        ctx: RequestContext,
        notificationIds: ReadNotificationsInputDto,
    ) {
        this.logger.log(ctx, `${this.markNotificationsAsRead.name} was called`);
        this.pg
            .any(
                'UPDATE "Notification" SET "read" = true, "updatedDate" = $1 WHERE "toUserId" = $2 AND "id" IN ($3:csv)',
                [
                    new Date(),
                    ctx.user.id,
                    notificationIds.ids.map((nId) => nId.id),
                ],
            )
            .then(async (res) => {
                this.streamService
                    .markAsRead(
                        ctx.user.id,
                        notificationIds.ids.map((nId) => nId.activityId),
                    )
                    .catch((err) => {
                        this.logger.error(
                            ctx,
                            `Error marking notifications as read in stream: ${err}`,
                        );
                    });
            })
            .catch((err) => {
                this.logger.error(
                    ctx,
                    `Error marking notifications as read: ${err}`,
                );
                throw new InternalServerErrorException(
                    'Error marking notifications as read',
                );
            });
    }

    async getUserNotificationCount(
        ctx: RequestContext,
    ): Promise<UnreadNotificationsDto> {
        this.logger.log(
            ctx,
            `${this.getUserNotificationCount.name} was called`,
        );

        const count = await this.pg.query(
            'SELECT COUNT(*) FROM "Notification" WHERE "toUserId" = $1 AND "read" = false',
            [ctx.user.id],
        );
        return {
            unreadCount: count,
        } as UnreadNotificationsDto;
    }

    async createNotification(
        ctx: RequestContext,
        {
            type,
            fromUserId,
            toUserId,
            sourceId,
            message,
        }: {
            type: NotificationType;
            fromUserId: string;
            toUserId: string;
            sourceId: string;
            message: string;
        },
    ) {
        if (fromUserId === toUserId) {
            // Don't notify self
            return;
        }

        const notification = {
            type: type,
            message: message,
            read: false,
            trash: false,
            createdDate: new Date(),
            updatedDate: new Date(),
            fromUserId: fromUserId,
            toUserId: toUserId,
            sourceId: sourceId,
        } as Notification;

        const sql = `INSERT INTO "Notification" ("id",
                                                 "type",
                                                 "message",
                                                 "read",
                                                 "trash",
                                                 "createdDate",
                                                 "updatedDate",
                                                 "fromUserId",
                                                 "toUserId",
                                                 "sourceId")
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                     ON CONFLICT DO NOTHING
                     RETURNING "Notification".id
        `;

        const response = await this.pg.oneOrNone(sql, [
            cuid(),
            notification.type,
            notification.message,
            notification.read,
            notification.trash,
            notification.createdDate,
            notification.updatedDate,
            notification.fromUserId,
            notification.toUserId,
            notification.sourceId,
        ]);

        if (response) {
            return response;
        }

        // get the existing notification id
        return await this.pg.oneOrNone(
            'SELECT "id" FROM "Notification" WHERE "fromUserId" = $1 AND "toUserId" = $2 AND "sourceId" = $3 AND "type" = $4',
            [fromUserId, toUserId, sourceId, type],
        );
    }
}
