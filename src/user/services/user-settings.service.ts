import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger, RequestContext } from '../../shared';
import { UserPushNotificationSettingsDto } from '../dtos/settings/user-push-notification-settings.dto';
import { plainToInstance } from 'class-transformer';
import { UserPushNotificationsInputDto } from '../dtos/settings/user-push-notifications-input.dto';

@Injectable()
export class UserSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(UserSettingsService.name);
  }

  async getPushNotificationSettings(
    ctx: RequestContext,
  ): Promise<UserPushNotificationSettingsDto> {
    this.logger.log(ctx, `${this.getPushNotificationSettings.name} was called`);
    const userSettings = await this.prisma.pushNotificationSettings.findUnique({
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
