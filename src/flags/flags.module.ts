import { Module } from '@nestjs/common';
import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../shared';
import { FlagGhillieService } from './services/flag-ghillie.service';
import { FlagGhillieController } from './controllers/flag-ghillie.controller';
import { FlagPostService } from './services/flag-post.service';
import { FlagPostController } from './controllers/flag-post.controller';
import { FlagCommentController } from './controllers/flag-comment.controller';
import { FlagCommentService } from './services/flag-comment.service';

@Module({
  providers: [
    FlagGhillieService,
    FlagPostService,
    FlagCommentService,
    JwtAuthStrategy,
    PrismaService,
    AppLogger,
  ],
  controllers: [
    FlagGhillieController,
    FlagPostController,
    FlagCommentController,
  ],
  exports: [FlagGhillieService, FlagPostService, FlagCommentService],
})
export class FlagsModule {}
