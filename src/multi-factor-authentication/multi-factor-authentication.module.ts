import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MultiFactorAuthenticationController } from './multi-factor-authentication.controller';
import { MultiFactorAuthenticationService } from './multi-factor-authentication.service';
import { AppLoggerModule } from '../shared/logger/logger.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../shared';
import { TokensModule } from '../shared/tokens/tokens.module';
import { AuthService } from '../auth/services/auth.service';
import { UserService } from '../user/services/user.service';
import { GeolocationService } from '../shared/geolocation/geolocation.service';
import { ApprovedSubnetsService } from '../approved-subnets/approved-subnets.service';
import { TwilioService } from '../shared/twilio/twilio.service';
import { TwilioModule } from '../shared/twilio/twilio.module';
import { SnsModule } from '../sns/sns.module';

@Module({
    imports: [
        AppLoggerModule,
        PrismaModule,
        MailModule,
        ConfigModule,
        TokensModule,
        TwilioModule,
        SnsModule,
    ],
    controllers: [MultiFactorAuthenticationController],
    providers: [
        MultiFactorAuthenticationService,
        AuthService,
        UserService,
        GeolocationService,
        ApprovedSubnetsService,
        TwilioService,
    ],
})
export class MultiFactorAuthenticationModule {}
