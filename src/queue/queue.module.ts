import { Module } from '@nestjs/common';
import { AppLogger } from '../shared';
import { QueueService } from './services/queue.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [AppLogger, QueueService, PrismaService],
  controllers: [],
  exports: [QueueService],
})
export class QueueModule {}
