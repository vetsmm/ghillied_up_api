import { MailerService } from '@vetsmm/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { RequestContext } from '../request-context';
import { AppLogger } from '../logger';
import * as Sentry from '@sentry/node';
import { UserOutput } from '../../user/dtos/public/user-output.dto';

@Injectable()
export class MailService {
    constructor(
        private mailerService: MailerService,
        private configService: ConfigService,
        private readonly logger: AppLogger,
    ) {
        this.logger.setContext(MailService.name);
    }

    async sendLoginSubnetApproval(
        ctx: RequestContext,
        user: UserOutput,
        locationName: string,
        jwtToken: string,
        expirationInMinutes: number,
    ) {
        this.mailerService
            .sendMail({
                to: `"${user.username}" <${user.email}>`,
                from: '"Ghillied Up" <support@ghilliedup.com>', // override default from
                subject: 'Sign in from new location',
                template: './loginSubnetApproval', // `.hbs` extension is appended automatically
                context: {
                    username: user.username,
                    locationName: locationName,
                    ipAddress: ctx.ip,
                    attemptTime: new Date().toLocaleString(),
                    confirmationLink: `https://ghilliedup.com/auth/confirm-subnet/${jwtToken}`,
                    expirationInMinutes: expirationInMinutes,
                    os: ctx.os,
                    platform: ctx.platform,
                },
            })
            .then(() => {
                const emailMask = user.email.replace(
                    /^(.{3}).*@(.*)$/,
                    '$1...@$2',
                );
                this.logger.log(
                    ctx,
                    `Successfully sent activation email to ${emailMask}`,
                );
            })
            .catch((err) => {
                // Create a mask for the email address that only captures the first 3 characters of the email and captures the entire domain
                const emailMask = user.email.replace(
                    /^(.{3}).*@(.*)$/,
                    '$1...@$2',
                );
                Sentry.captureException(err);
                this.logger.error(
                    ctx,
                    `Error sending activation email to '<${emailMask}>': ${err}`,
                );
            });
    }

    async sendUserActivation(
        ctx: RequestContext,
        username: string,
        email: string,
        activationCode: number,
    ) {
        const expirationInMs = this.configService.get<number>(
            'auth.activationCodeExpiryInMs',
        );
        const expirationInMinutes = Math.floor(expirationInMs / 1000 / 60);
        await this.mailerService
            .sendMail({
                to: `"${username}" <${email}>`,
                from: '"Ghillied Up" <support@ghilliedup.com>', // override default from
                subject: 'Welcome to Ghillied Up! Confirm your Email',
                template: './activationEmail', // `.hbs` extension is appended automatically
                context: {
                    // ✏️ filling curly brackets with content
                    username: username,
                    activationCode: activationCode,
                    expirationInMinutes: expirationInMinutes,
                    activationLink: `https://ghilliedup.com/auth/activate/${activationCode}`,
                },
            })
            .then(() => {
                const emailMask = email.replace(/^(.{3}).*@(.*)$/, '$1...@$2');
                this.logger.log(
                    ctx,
                    `Successfully sent activation email to ${emailMask}`,
                );
            })
            .catch((err) => {
                // Create a mask for the email address that only captures the first 3 characters of the email and captures the entire domain
                const emailMask = email.replace(/^(.{3}).*@(.*)$/, '$1...@$2');
                this.logger.error(
                    ctx,
                    `Error sending activation email to '<${emailMask}>': ${err}`,
                );
            });
    }

    async sendPasswordReset(ctx: RequestContext, user: User) {
        await this.mailerService
            .sendMail({
                to: `"${user.username}" <${user.email}>`,
                from: '"Ghillied Up Support" <support@ghilliedup.com>',
                subject: 'Reset your password',
                template: './resetPasswordEmail',
                context: {
                    username: user.username,
                    resetKey: user.resetKey,
                    resetLink: `https://ghilliedup.com/auth/password-reset/${user.resetKey}`,
                },
            })
            .then(() => {
                this.logger.debug(
                    ctx,
                    `Successfully sent password reset email to ${user.username}`,
                );
            })
            .catch((err) => {
                this.logger.error(
                    ctx,
                    `Error sending password reset email: ${err}`,
                );
            });
    }
}
