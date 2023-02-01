import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger } from '../logger';

@Injectable()
export class TasksService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private logger: AppLogger,
    ) {
        this.logger.setContext(TasksService.name);
    }

    @Cron(CronExpression.EVERY_DAY_AT_1PM)
    async deleteOldSessions() {
        const now = new Date();
        const unusedRefreshTokenExpiryDays =
            this.configService.get<number>(
                'jwt.unusedRefreshTokenExpiryDays',
            ) ?? 30;
        now.setDate(now.getDate() - unusedRefreshTokenExpiryDays);
        const deleted = await this.prisma.session.deleteMany({
            where: { updatedDate: { lte: now } },
        });
        if (deleted.count)
            this.logger.log(null, `Deleted ${deleted.count} expired sessions`);
    }
}
