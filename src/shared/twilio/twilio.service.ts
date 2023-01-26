import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PQueue from 'p-queue';
import pRetry from 'p-retry';
import twilio from 'twilio';
import { AWSSecretsService } from '../secrets-manager';
import { AppLogger } from '../logger';
import { RequestContext } from '../request-context';
import Twilio from 'twilio/dist/lib/rest/Twilio';
import { VerificationInstance } from 'twilio/dist/lib/rest/verify/v2/service/verification';
import { VerificationCheckInstance } from 'twilio/dist/lib/rest/verify/v2/service/verificationCheck';
import { MessageInstance } from 'twilio/dist/lib/rest/api/v2010/account/message';

@Injectable()
export class TwilioService {
    client: Twilio;
    private queue = new PQueue({ concurrency: 1 });

    private serviceSid: string;

    constructor(
        private logger: AppLogger,
        private configService: ConfigService,
        private secretsService: AWSSecretsService,
    ) {
        this.logger.setContext(TwilioService.name);

        this.initTwilioClient();
    }

    private initTwilioClient() {
        if (this.configService.get('appEnv') === 'DEV') {
            const twilioConfig = this.configService.get<any>('sms');
            if (!twilioConfig.twilioAccountSid || !twilioConfig.twilioAuthToken)
                this.logger.warn(
                    null,
                    'Twilio account SID/auth token not found in config',
                );
            this.client = twilio(
                twilioConfig.twilioAccountSid ||
                    'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                twilioConfig.twilioAuthToken ||
                    'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            );
        } else {
            this.secretsService
                .getSecrets<{
                    TWILIO_ACCOUNT_SID: string;
                    TWILIO_ACCOUNT_TOKEN: string;
                    TWILIO_VERIFICATION_SERVICE_SID: string;
                }>(this.configService.get('secretsSources.twilio'))
                .then((twilioConfig) => {
                    this.client = twilio(
                        twilioConfig.TWILIO_ACCOUNT_SID ||
                            'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                        twilioConfig.TWILIO_ACCOUNT_TOKEN ||
                            'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                    );
                    this.serviceSid =
                        twilioConfig.TWILIO_VERIFICATION_SERVICE_SID;
                })
                .catch((error) => {
                    this.logger.error(null, `Twilio config error`, error);
                    this.client = twilio(
                        'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                        'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                    );
                });
        }
    }

    initiatePhoneNumberVerification(
        ctx: RequestContext,
        phoneNumber: string,
    ): Promise<VerificationInstance> {
        return this.client.verify.v2
            .services(this.serviceSid)
            .verifications.create({ to: phoneNumber, channel: 'sms' });
    }

    async confirmPhoneNumber(
        ctx: RequestContext,
        phoneNumber: string,
        verificationCode: string,
    ): Promise<VerificationCheckInstance> {
        return this.client.verify.v2
            .services(this.serviceSid)
            .verificationChecks.create({
                to: phoneNumber,
                code: verificationCode,
            });
    }

    send(ctx: RequestContext, message: string, receiverPhoneNumber: string) {
        this.queue
            .add(() =>
                pRetry(() => this.sendSms(message, receiverPhoneNumber), {
                    retries: this.configService.get<number>('sms.retries') ?? 3,
                    onFailedAttempt: (error) => {
                        this.logger.error(
                            ctx,
                            `SMS to ${receiverPhoneNumber} failed, retrying (${error.retriesLeft} attempts left)`,
                            error,
                        );
                    },
                }),
            )
            .then(() =>
                this.logger.log(
                    ctx,
                    `SMS to ${receiverPhoneNumber} sent successfully`,
                ),
            )
            .catch((error) =>
                this.logger.error(
                    ctx,
                    `SMS to ${receiverPhoneNumber} failed`,
                    error,
                ),
            );
    }

    private async sendSms(
        message: string,
        receiverPhoneNumber,
    ): Promise<MessageInstance> {
        const senderPhoneNumber = this.configService.get<string>(
            'sms.senderPhoneNumber',
        );
        return this.client.messages.create({
            body: message,
            from: senderPhoneNumber,
            to: receiverPhoneNumber,
        });
    }
}
