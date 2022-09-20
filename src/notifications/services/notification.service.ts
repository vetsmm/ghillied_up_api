import {Injectable} from "@nestjs/common";
import {AppLogger, PageInfo, parsePaginationArgs, RequestContext} from "../../shared";
import {NotificationInputDto} from "../dtos/notification-input.dto";
import {NotificationDto} from "../dtos/notification.dto";
import {plainToInstance} from "class-transformer";
import {PrismaService} from "../../prisma/prisma.service";
import {UnreadNotificationsDto} from "../dtos/unread-notifications.dto";

@Injectable()
export class NotificationService {
    constructor(
        private readonly logger: AppLogger,
        private readonly prisma: PrismaService,
    ) {
        this.logger.setContext(NotificationService.name);
    }

    async getNotifications(ctx: RequestContext, body: NotificationInputDto): Promise<{
        notifications: NotificationDto[],
        pageInfo: PageInfo
    }> {
        this.logger.log(ctx, `${this.getNotifications.name} was called`);

        const {findManyArgs, toConnection, toResponse} = parsePaginationArgs({
            first: body.take - 1,
            after: body.cursor ? body.cursor : null,
        });

        const notifications = await this.prisma.notification.findMany({
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

        return {
            notifications: plainToInstance(NotificationDto, toResponse(notifications), {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            }),
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
}
