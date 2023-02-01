import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TasksService } from './tasks.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AppLoggerModule } from '../logger/logger.module';

@Module({
    imports: [ConfigModule, PrismaModule, AppLoggerModule],
    providers: [TasksService],
    exports: [TasksService],
})
export class TasksModule {}
