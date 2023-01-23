import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../prisma/prisma.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GhillieModule } from '../ghillie/ghillies.module';
import { PostsModule } from '../posts/posts.module';
import { FeedsModule } from '../feeds/feeds.module';
import { FlagsModule } from '../flags/flags.module';
import {
    AllExceptionsFilter,
    LoggingInterceptor,
    SharedModule,
} from '../shared';
import { QueueModule } from '../queue/queue.module';
import { SettingsModule } from '../settings/settings.module';
import { NotificationModule } from '../notifications/notification.module';
import { FilesModule } from '../files/files.module';
import { OpenGraphModule } from '../open-graph/open-graph.module';
import { CommentsModule } from '../comments/comments.module';
import { PushNotificationsModule } from '../push-notifications/push-notifications.module';
import { ApprovedSubnetsModule } from '../approved-subnets/approved-subnets.module';
import { SessionsModule } from '../sessions/sessions.module';
import { RateLimitInterceptor } from '../shared/interceptors/rate-limit.interceptor';

@Module({
    imports: [
        AuthModule,
        UserModule,
        PrismaModule,
        SharedModule,
        GhillieModule,
        PostsModule,
        FeedsModule,
        FlagsModule,
        QueueModule,
        SettingsModule,
        NotificationModule,
        FilesModule,
        OpenGraphModule,
        CommentsModule,
        PushNotificationsModule,
        ApprovedSubnetsModule,
        SessionsModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: RateLimitInterceptor,
        },
    ],
})
export class AppModule {}
