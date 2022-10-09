import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger, RequestContext } from '../../shared';
import { DeviceTokenInputDto } from '../dtos/device-token-input.dto';
import { UserPushNotificationSettingsDto } from '../dtos/settings/user-push-notification-settings.dto';
import { plainToInstance } from 'class-transformer';
import { UserPushNotificationsInputDto } from '../dtos/settings/user-push-notifications-input.dto';

@Injectable()
export class SettingsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: AppLogger,
    ) {
        this.logger.setContext(SettingsService.name);
    }

    async createDeviceToken(
        ctx: RequestContext,
        input: DeviceTokenInputDto,
    ): Promise<void> {
        this.logger.log(ctx, `${this.createDeviceToken.name} was called`);

        // If device token already exists, do nothing, otherwise create it
        const deviceToken = await this.prisma.devicePushToken.findFirst({
            where: {
                AND: [{ token: input.deviceToken }, { userId: ctx.user.id }],
            },
        });

        if (!deviceToken) {
            this.logger.log(
                ctx,
                `Creating new device token for user ${ctx.user.id}`,
            );
            await this.prisma.devicePushToken.create({
                data: {
                    token: input.deviceToken,
                    platform: input.phonePlatform,
                    user: {
                        connect: {
                            id: ctx.user.id,
                        },
                    },
                },
            });
        }
    }

    async getPushNotificationSettings(
        ctx: RequestContext,
    ): Promise<UserPushNotificationSettingsDto> {
        this.logger.log(
            ctx,
            `${this.getPushNotificationSettings.name} was called`,
        );
        const userSettings =
            await this.prisma.pushNotificationSettings.findUnique({
                where: {
                    userId: ctx.user.id,
                },
            });

        return plainToInstance(UserPushNotificationSettingsDto, userSettings, {
            excludeExtraneousValues: true,
        });
    }

    async updatePushNotificationSettings(
        ctx: RequestContext,
        settings: UserPushNotificationsInputDto,
    ): Promise<UserPushNotificationSettingsDto> {
        this.logger.log(
            ctx,
            `${this.updatePushNotificationSettings.name} was called`,
        );
        const userSettings = await this.prisma.pushNotificationSettings.update({
            where: {
                userId: ctx.user.id,
            },
            data: settings,
        });

        return plainToInstance(UserPushNotificationSettingsDto, userSettings, {
            excludeExtraneousValues: true,
        });
    }
}
