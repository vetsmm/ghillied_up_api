import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { MailerOptions, MailerOptionsFactory } from '@vetsmm/mailer';
import { HandlebarsAdapter } from '@vetsmm/mailer/dist/adapters/handlebars.adapter';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import * as aws from '@aws-sdk/client-ses';
import { ConfigService } from '@nestjs/config';
import { AWSSecretsService } from '../secrets-manager';

@Injectable()
export class MailConfigService implements MailerOptionsFactory {
    constructor(
        private configService: ConfigService,
        private secretsService: AWSSecretsService,
    ) {}

    async createMailerOptions(): Promise<MailerOptions> {
        if (this.configService.get('env') === 'production') {
            return this.createProductionMailerOptions();
        }
        return await this.createDevelopmentMailerOptions();
    }

    createProductionMailerOptions(): MailerOptions {
        const ses = new aws.SES({
            apiVersion: '2010-12-01',
            region: 'us-east-1',
            credentialDefaultProvider: defaultProvider,
        });

        return {
            transport: {
                SES: { ses, aws },
            },
            defaults: {
                from: `"${this.configService.get(
                    'mail.defaultName',
                )}" <${this.configService.get('mail.defaultEmail')}>`,
            },
            template: {
                // Get the templates direction from the current directory
                dir: path.join(
                    process.cwd(),
                    'src',
                    'assets',
                    'mail-templates',
                ),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                },
            },
        } as MailerOptions;
    }

    async getSecrets(): Promise<any> {
        if (this.configService.get('appEnv') === 'DEV') {
            return {
                MAIL_USER: this.configService.get('mail.user'),
                MAIL_PASSWORD: this.configService.get('mail.password'),
            };
        }

        return await this.secretsService.getSecrets<{
            MAIL_USER: string;
            MAIL_PASSWORD: string;
        }>(this.configService.get('secretsSources.mail'));
    }

    async createDevelopmentMailerOptions(): Promise<MailerOptions> {
        const mailSecrets = await this.getSecrets();
        return {
            transport: {
                host: this.configService.get('mail.host'),
                port: this.configService.get('mail.port'),
                ignoreTLS: this.configService.get('mail.ignoreTLS'),
                secure: this.configService.get('mail.secure'),
                requireTLS: this.configService.get('mail.requireTLS'),
                auth: {
                    user: mailSecrets.MAIL_USER,
                    pass: mailSecrets.MAIL_PASSWORD,
                },
            },
            defaults: {
                from: `"${this.configService.get(
                    'mail.defaultName',
                )}" <${this.configService.get('mail.defaultEmail')}>`,
            },
            template: {
                // Get the templates direction from the current directory
                dir: path.join(
                    process.cwd(),
                    'src',
                    'assets',
                    'mail-templates',
                ),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                },
            },
        } as MailerOptions;
    }
}
