import {Inject, Injectable, InternalServerErrorException} from "@nestjs/common";
import {AppLogger, PageInfo, parsePaginationArgs, RequestContext} from "../../shared";
import {NotificationInputDto} from "../dtos/notification-input.dto";
import {
    BaseNotificationDto,
    PostCommentNotificationDto,
    PostCommentReactionNotificationDto, PostReactionNotificationDto
} from "../dtos/notification.dto";
import {PrismaService} from "../../prisma/prisma.service";
import {UnreadNotificationsDto} from "../dtos/unread-notifications.dto";
import {NEST_PGPROMISE_CONNECTION} from "nestjs-pgpromise";
import {IDatabase} from "pg-promise";
import Immutable from "immutable";
import {NotificationType} from "@prisma/client";


@Injectable()
export class NotificationService {
    constructor(
        private readonly logger: AppLogger,
        private readonly prisma: PrismaService,
        @Inject(NEST_PGPROMISE_CONNECTION) private readonly pg: IDatabase<any>
    ) {
        this.logger.setContext(NotificationService.name);
    }

    async getNotifications(ctx: RequestContext, body: NotificationInputDto): Promise<{
        notifications: BaseNotificationDto[],
        pageInfo: PageInfo
    }> {
        this.logger.log(ctx, `${this.getNotifications.name} was called`);

        const {findManyArgs, toConnection, toResponse} = parsePaginationArgs({
            first: body.take - 1,
            after: body.cursor ? body.cursor : null,
        });

        const notifications: any = await this.prisma.notification.findMany({
            ...findManyArgs,
            where: {
                AND: [
                    {toUserId: ctx.user.id},
                    {read: body.read},
                    {trash: body.trash},
                    {type: body.type},

                ]
            },
            orderBy: [
                {createdDate: "desc"},
                {read: "asc"}
            ]
        });

        const hydratedNotifications: any[] = (await this.hydrateNotifications(
            ctx,
            notifications
        ));

        // sort hydrated notifications by createdDate
        hydratedNotifications.sort((a, b) => {
            return b.createdDate.getTime() - a.createdDate.getTime();
        });

        return {
            notifications: toResponse(hydratedNotifications),
            pageInfo: toConnection(notifications).pageInfo,
        };
    }

    async markNotificationAsRead(ctx: RequestContext, notificationIds: string[]) {
        this.logger.log(ctx, `${this.markNotificationAsRead.name} was called`);

        await this.prisma.notification.updateMany({
            where: {
                AND: [
                    {toUserId: ctx.user.id},
                    {id: {in: notificationIds}},
                ]
            },
            data: {
                read: true,
                updatedDate: new Date()
            }
        });
    }

    async getUserNotificationCount(ctx: RequestContext): Promise<UnreadNotificationsDto> {
        this.logger.log(ctx, `${this.getUserNotificationCount.name} was called`);

        const count = await this.prisma.notification.count({
            where: {
                AND: [
                    {toUserId: ctx.user.id},
                    {read: false},
                    {trash: false},
                ]
            }
        });
        return {
            unreadCount: count
        } as UnreadNotificationsDto;
    }

    private async hydrateNotifications(ctx: RequestContext, notifications: any[]): Promise<any[]> {
        this.logger.log(ctx, `${this.hydrateNotifications.name} was called`);

        const notificationsByType = Immutable.Map<NotificationType, string[]>().withMutations(map => {
            notifications.forEach(notification => {
                const ids = map.get(notification.type) || [];
                ids.push(notification.sourceId);
                map.set(notification.type, ids);
            });
        });

        return this.pg.task(async t => {
            const reactionIds = notificationsByType.get(NotificationType.POST_REACTION) || [];
            const commentIds = notificationsByType.get(NotificationType.POST_COMMENT) || [];
            const commentReactionIds = notificationsByType.get(NotificationType.POST_COMMENT_REACTION) || [];

            const postCommentsHydrated = commentIds.length > 0 ? t.query(
                'SELECT pc.id as "sourceId", pc.content as "commentContent", u.username, g.id as "ghillieId", g.name as "ghillieName", g."imageUrl" as "ghillieImageUrl",p.id as "postId" FROM "PostComment" pc JOIN "User" u ON pc."createdById" = u.id JOIN "Post" p ON pc."postId" = p.id JOIN "Ghillie" g on g.id = p."ghillieId"WHERE pc.id IN ($1:list)',
                [commentIds]
            ) : [];
            const postCommentReactionsHydrated = commentReactionIds.length > 0 ? t.query(
                'SELECT cr.id as "sourceId", cr."reactionType", u.username, g.id as "ghillieId", g.name as "ghillieName", g."imageUrl" as "ghillieImageUrl", p.id as "postId" FROM "CommentReaction" cr JOIN "User" u ON cr."createdById" = u.id JOIN "PostComment" pc ON cr."commentId" = pc.id JOIN "Post" p ON pc."postId" = p.id JOIN "Ghillie" g on g.id = p."ghillieId" WHERE cr.id IN ($1:list)',
                [commentReactionIds]
            ) : [];
            const postReactionsHydrated = reactionIds.length > 0 ? t.query(
                'SELECT pr.id as "sourceId", pr."reactionType", u.username, g.id as "ghillieId", g.name as "ghillieName", g."imageUrl" as "ghillieImageUrl", p.id as "postId" FROM "PostReaction" pr JOIN "User" u ON pr."createdById" = u.id JOIN "Post" p ON pr."postId" = p.id JOIN "Ghillie" g on g.id = p."ghillieId" WHERE pr.id IN ($1:list)',
                [reactionIds]
            ) : [];

            return [... await postCommentReactionsHydrated, ... await postCommentsHydrated, ... await postReactionsHydrated];
        })
            .then(data => {
                return data.map(hydratedData => {
                    const notification = notifications.find(d => d.sourceId === hydratedData.sourceId);
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
            .catch(err => {
                this.logger.error(ctx, err);
                throw new InternalServerErrorException("Error retrieving notifications");
            });
    }

    async markAllNotificationsAsRead(ctx: RequestContext): Promise<void> {
        this.logger.log(ctx, `${this.markAllNotificationsAsRead.name} was called`);

        await this.pg.none(
            'UPDATE "Notification" SET "read" = true, "updatedDate" = $1 WHERE "toUserId" = $2 AND "read" = false AND "trash" = false',
            [new Date(), ctx.user.id]
        );
    }

    async markNotificationAsTrash(ctx: RequestContext, notificationIds: string[]): Promise<void> {
        this.logger.log(ctx, `${this.markNotificationAsTrash.name} was called`);

        await this.pg.none(
            'UPDATE "Notification" SET "trash" = true, "updatedDate" = $1 WHERE "toUserId" = $2 AND "id" IN ($3:list)',
            [new Date(), ctx.user.id, notificationIds]
        );
    }

    async markAllNotificationsAsTrash(ctx: RequestContext): Promise<void> {
        this.logger.log(ctx, `${this.markAllNotificationsAsTrash.name} was called`);

        await this.pg.none(
            'UPDATE "Notification" SET "trash" = true, "updatedDate" = $1 WHERE "toUserId" = $2 AND "trash" = false',
            [new Date(), ctx.user.id]
        );
    }
}
