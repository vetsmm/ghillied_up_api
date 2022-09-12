import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { AppLogger } from '../logger';

@Module({
  imports: [],
  providers: [MailService, AppLogger],
  exports: [MailService],
})
export class MailModule {}
