import { Module } from '@nestjs/common';
import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../shared';
import { PostFeedAclService } from './services/post-feed-acl.service';
import { FeedController } from './controllers/feed.controller';
import { PostFeedService } from './services/post-feed.service';
import { PostAclService } from '../posts/services/post-acl.service';

@Module({
    providers: [
        JwtAuthStrategy,
        PrismaService,
        AppLogger,
        PostFeedAclService,
        PostAclService,
        PostFeedService,
    ],
    controllers: [FeedController],
    exports: [PostFeedService],
})
export class FeedsModule {}
