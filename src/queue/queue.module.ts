import { Module } from '@nestjs/common';
import {AppLogger} from "../shared";
import {QueueService} from "./services/queue.service";


@Module({
  providers: [
    AppLogger,
    QueueService
  ],
  controllers: [],
  exports: [QueueService],
})
export class QueueModule {}
