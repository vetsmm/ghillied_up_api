import { Module } from '@nestjs/common';
import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../shared';
import {SettingsService} from "./services/settings.service";
import {SettingsController} from "./controllers/settings.controller";

@Module({
  providers: [
    JwtAuthStrategy,
    PrismaService,
    AppLogger,
    SettingsService,
  ],
  controllers: [SettingsController],
  exports: [SettingsService],
})
export class SettingsModule {}
