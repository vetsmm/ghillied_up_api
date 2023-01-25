import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { MultiFactorAuthenticationController } from './multi-factor-authentication.controller';
import { MultiFactorAuthenticationService } from './multi-factor-authentication.service';
import { AppLoggerModule } from '../shared/logger/logger.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../shared';
import { TokensModule } from '../shared/tokens/tokens.module';
import { AuthService } from '../auth/services/auth.service';
import { SmsService } from '../sns/services/sms.service';
import { UserService } from '../user/services/user.service';
import { GeolocationService } from '../shared/geolocation/geolocation.service';
import { ApprovedSubnetsService } from '../approved-subnets/approved-subnets.service';
import { QueueService } from '../sns/services/queue.service';
import { SnsModule } from '../sns/sns.module';

@Module({
    imports: [
        AppLoggerModule,
        PrismaModule,
        MailModule,
        ConfigModule,
        TokensModule,
        SnsModule,
    ],
    controllers: [MultiFactorAuthenticationController],
    providers: [
        MultiFactorAuthenticationService,
        AuthService,
        SmsService,
        UserService,
        GeolocationService,
        ApprovedSubnetsService,
    ],
})
export class MultiFactorAuthenticationModule {}
