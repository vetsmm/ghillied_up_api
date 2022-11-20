import { Module } from '@nestjs/common';
import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../shared';
import { HttpModule } from '@nestjs/axios';
import { CommentAclService } from './services/comment-acl.service';
import { ParentCommentController } from './controllers/parent-comment.controller';
import { ParentCommentService } from './services/parent-comment.service';
import { QueueService } from '../queue/services/queue.service';
import { NotificationService } from '../notifications/services/notification.service';
import { CommentReplyService } from './services/comment-reply.service';
import { CommentReplyController } from './controllers/comment-reply.controller';

@Module({
    imports: [HttpModule],
    providers: [
        JwtAuthStrategy,
        PrismaService,
        AppLogger,
        QueueService,
        NotificationService,
        CommentAclService,
        ParentCommentService,
        CommentReplyService,
    ],
    controllers: [ParentCommentController, CommentReplyController],
    exports: [],
})
export class CommentsModule {}
