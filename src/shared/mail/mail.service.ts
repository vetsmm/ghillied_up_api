import { MailerService } from '@vetsmm/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { RequestContext } from '../request-context';
import { AppLogger } from '../logger';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(MailService.name);
  }

  async sendUserActivation(
    ctx: RequestContext,
    username: string,
    email: string,
    activationCode: number,
  ) {
    await this.mailerService
      .sendMail({
        to: email,
        from: '"Support Team" <support@ghilliedup.com>', // override default from
        subject: 'Welcome to Ghillied Up! Confirm your Email',
        template: './activationEmail', // `.hbs` extension is appended automatically
        context: {
          // ✏️ filling curly brackets with content
          username: username,
          activationCode: activationCode,
        },
      })
      .then(() => {
        this.logger.debug(
          ctx,
          `Successfully sent activation email to ${username}`,
        );
      })
      .catch((err) => {
        this.logger.error(ctx, `Error sending activation email: ${err}`);
      });
  }

  async sendPasswordReset(ctx: RequestContext, user: User) {
    await this.mailerService
      .sendMail({
        to: user.email,
        from: '"Support Team" <support@ghilliedup.com>',
        subject: 'Reset your password',
        template: './resetPasswordEmail',
        context: {
          username: user.username,
          resetKey: user.resetKey,
        },
      })
      .then(() => {
        this.logger.debug(
          ctx,
          `Successfully sent password reset email to ${user.username}`,
        );
      })
      .catch((err) => {
        this.logger.error(ctx, `Error sending password reset email: ${err}`);
      });
  }
}
