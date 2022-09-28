import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configModuleOptions } from './configs/module-options';
import { AppLoggerModule } from './logger/logger.module';
import { MailConfigService, MailModule } from './mail';
import { MailerModule } from '@vetsmm/mailer';
import { SnsModule } from '@vetsmm/nestjs-sns';
import { NestPgpromiseModule } from 'nestjs-pgpromise';
import { PgPromiseConfigService } from './database/pgpromise-config.service';
import { GetStreamModule } from './getsream/getstream.module';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    AppLoggerModule,
    MailModule,
    MailerModule.forRootAsync({
      useClass: MailConfigService,
    }),
    NestPgpromiseModule.registerAsync({
      useClass: PgPromiseConfigService,
    }),
    SnsModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        region: configService.get<string>('aws.region'),
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
    GetStreamModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          apiKey: configService.get('stream.apiKey'),
          apiSecret: configService.get('stream.apiSecret'),
          appId: configService.get('stream.appId'),
          clientOptions: {
            timeout: 10000,
          },
        };
      },
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [],
  exports: [AppLoggerModule, ConfigModule, MailModule],
})
export class SharedModule {}
