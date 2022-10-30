import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../shared';
import { GhillieAssetsService } from './services/ghillie-assets.service';

@Module({
    providers: [PrismaService, AppLogger, GhillieAssetsService],
    controllers: [],
    exports: [GhillieAssetsService],
})
export class FilesModule {}
