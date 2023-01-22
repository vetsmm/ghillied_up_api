import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { UserModule } from '../user/user.module';
import { STRATEGY_JWT_AUTH } from './constants/strategy.constant';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtAuthStrategy } from './strategies/jwt-auth.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { SharedModule } from '../shared';
import { HttpModule } from '@nestjs/axios';
import { AuthIdMeController } from './controllers/id-me.controller';
import { AuthIdMeService } from './services/id-me.service';
import { ApprovedSubnetsModule } from '../approved-subnets/approved-subnets.module';
import { GeolocationModule } from '../shared/geolocation/geolocation.module';
import { ApprovedSubnetsService } from '../approved-subnets/approved-subnets.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    imports: [
        SharedModule,
        PassportModule.register({ defaultStrategy: STRATEGY_JWT_AUTH }),
        UserModule,
        AuthModule,
        HttpModule,
        GeolocationModule,
        ApprovedSubnetsModule,
    ],
    controllers: [AuthController, AuthIdMeController],
    providers: [
        AuthService,
        LocalStrategy,
        JwtAuthStrategy,
        JwtRefreshStrategy,
        AuthIdMeService,
        ApprovedSubnetsService,
        PrismaService,
    ],
})
export class AuthModule {}
