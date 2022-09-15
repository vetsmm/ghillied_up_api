import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../prisma/prisma.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GhillieModule } from '../ghillie/ghillies.module';
import { PostsModule } from '../posts/posts.module';
import { PostFeedModule } from '../post-feed/post-feed.module';
import { FlagsModule } from '../flags/flags.module';
import {
  AllExceptionsFilter,
  LoggingInterceptor,
  SharedModule,
} from '../shared';
import {QueueModule} from "../queue/queue.module";
import {SettingsModule} from "../settings/settings.module";

@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    SharedModule,
    GhillieModule,
    PostsModule,
    PostFeedModule,
    FlagsModule,
    QueueModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
