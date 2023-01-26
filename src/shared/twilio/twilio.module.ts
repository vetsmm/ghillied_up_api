import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TwilioService } from './twilio.service';
import { AppLoggerModule } from '../logger/logger.module';

@Module({
    imports: [ConfigModule, AppLoggerModule],
    providers: [TwilioService],
    exports: [TwilioService],
})
export class TwilioModule {}
