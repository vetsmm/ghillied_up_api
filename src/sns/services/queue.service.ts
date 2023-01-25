import { Injectable } from '@nestjs/common';
import { AppLogger, RequestContext } from '../../shared';
import { SnsService } from '@vetsmm/nestjs-sns';
import * as snsTypes from '@vetsmm/nestjs-sns/dist/sns.types';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { UserPurgeDto } from '../../user/dtos/user-purge.dto';

@Injectable()
export class QueueService {
    constructor(
        private readonly logger: AppLogger,
        private readonly snsService: SnsService,
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
    ) {
        this.logger.setContext(QueueService.name);
    }

    public async publishAccountPurge(
        ctx: RequestContext,
        purgeMessage: UserPurgeDto,
    ): Promise<snsTypes.PublishResponse> {
        this.logger.log(ctx, `${this.publishAccountPurge.name} was called`);
        const purgeArn = this.configService.get<string>(
            'aws.sns.accountPurgeArn',
        );
        const message = JSON.stringify(purgeMessage);

        const snsResponse: snsTypes.PublishResponse =
            await this.snsService.publish({
                MessageGroupId: `account-purge-${uuidv4()}`,
                MessageDeduplicationId: `${uuidv4()}`,
                Message: message,
                TopicArn: purgeArn,
            });

        this.logger.log(
            ctx,
            `${this.publishAccountPurge.name} snsResponse: ${JSON.stringify(
                snsResponse,
            )}`,
        );
        return snsResponse;
    }
}
