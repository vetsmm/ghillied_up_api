import { Module } from '@nestjs/common';
import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../shared';
import { GhillieService } from './services/ghillie.service';
import { GhillieAclService } from './services/ghillie-acl.service';
import { GhillieController } from './controllers/v1/ghillie.controller';
import { FlagGhillieService } from '../flags/services/flag-ghillie.service';
import { FlagGhillieController } from '../flags/controllers/flag-ghillie.controller';
import { GhillieAssetsService } from '../files/services/ghillie-assets.service';
import { GhillieStartupService } from './services/ghillie-startup.service';
import { QueueService } from '../queue/services/queue.service';

@Module({
    providers: [
        GhillieService,
        FlagGhillieService,
        GhillieAclService,
        JwtAuthStrategy,
        PrismaService,
        AppLogger,
        GhillieAssetsService,
        GhillieStartupService,
        QueueService,
    ],
    controllers: [GhillieController, FlagGhillieController],
    exports: [GhillieService, FlagGhillieService],
})
export class GhillieModule {}
