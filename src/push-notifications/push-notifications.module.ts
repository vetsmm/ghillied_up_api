import { Module } from '@nestjs/common';
import { AppLogger } from '../shared';
import { PrismaService } from '../prisma/prisma.service';
import { PushNotificationService } from './services/push-notification.service';
import { PushNotificationRepository } from './repository/push-notification.repository';

@Module({
    providers: [
        AppLogger,
        PrismaService,
        PushNotificationService,
        PushNotificationRepository,
    ],
    controllers: [],
    exports: [PushNotificationService, PushNotificationRepository],
})
export class PushNotificationsModule {}
