import { Module } from '@nestjs/common';
import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../shared';
import { PostFeedAclService } from './services/post-feed-acl.service';
import { FeedController } from './controllers/feed.controller';
import { PostFeedService } from './services/post-feed.service';
import { PostAclService } from '../posts/services/post-acl.service';
import { BookmarkPostFeedService } from './services/bookmark-post-feed.service';

@Module({
    providers: [
        JwtAuthStrategy,
        PrismaService,
        AppLogger,
        PostFeedAclService,
        PostAclService,
        PostFeedService,
        BookmarkPostFeedService,
    ],
    controllers: [FeedController],
    exports: [PostFeedService, BookmarkPostFeedService],
})
export class FeedsModule {}
