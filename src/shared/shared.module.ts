import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configModuleOptions } from './configs/module-options';
import { AppLoggerModule } from './logger/logger.module';
import { MailConfigService, MailModule } from './mail';
import { MailerModule } from '@vetsmm/mailer';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    AppLoggerModule,
    MailModule,
    MailerModule.forRootAsync({
      useClass: MailConfigService,
    }),
  ],
  controllers: [],
  providers: [],
  exports: [AppLoggerModule, ConfigModule, MailModule],
})
export class SharedModule {}
