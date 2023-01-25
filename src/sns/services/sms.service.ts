import { Injectable } from '@nestjs/common';
import { AppLogger, RequestContext } from '../../shared';
import { SnsService } from '@vetsmm/nestjs-sns';
import * as snsTypes from '@vetsmm/nestjs-sns/dist/sns.types';

@Injectable()
export class SmsService {
    constructor(
        private readonly logger: AppLogger,
        private readonly snsService: SnsService,
    ) {
        this.logger.setContext(SmsService.name);
    }

    public async sendSMS(
        ctx: RequestContext,
        toNumber: string,
        subject: string,
        message: string,
    ): Promise<snsTypes.PublishResponse> {
        this.logger.log(ctx, `${this.sendSMS.name} was called`);

        const snsResponse = await this.snsService.publish({
            Message: message,
            Subject: subject,
            PhoneNumber: toNumber,
            // MessageAttributes: {
            //     "DefaultSMSType": {
            //         a
            //     }
            // },
        });

        this.logger.log(
            ctx,
            `${this.sendSMS.name} snsResponse: ${JSON.stringify(snsResponse)}`,
        );
        return snsResponse;
    }
}
