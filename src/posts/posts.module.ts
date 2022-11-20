import { Module } from '@nestjs/common';
import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../shared';
import { PostAclService } from './services/post-acl.service';
import { PostService } from './services/post.service';
import { PostController } from './controllers/post.controller';
import { PostReactionService } from './services/post-reaction.service';
import { PostReactionAclService } from './services/post-reaction-acl.service';
import { PostReactionController } from './controllers/post-reaction.controller';
import { PostCommentAclService } from './services/post-comment-acl.service';
import { CommentReactionController } from './controllers/comment-reaction.controller';
import { PostCommentReactionService } from './services/post-comment-reaction.service';
import { QueueService } from '../queue/services/queue.service';
import { NotificationService } from '../notifications/services/notification.service';
import { PostBookmarkService } from './services/post-bookmark.service';
import { OpenGraphService } from '../open-graph/open-graph.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule],
    providers: [
        JwtAuthStrategy,
        PrismaService,
        AppLogger,
        OpenGraphService,
        PostAclService,
        PostService,
        PostReactionService,
        PostReactionAclService,
        PostCommentAclService,
        PostCommentReactionService,
        QueueService,
        NotificationService,
        PostBookmarkService,
    ],
    controllers: [
        PostController,
        PostReactionController,
        CommentReactionController,
    ],
    exports: [PostService, PostReactionService, PostBookmarkService],
})
export class PostsModule {}
