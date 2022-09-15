import {Injectable} from "@nestjs/common";
import {AppLogger, RequestContext} from "../../shared";
import {SnsService} from "@vetsmm/nestjs-sns";
import * as snsTypes from "@vetsmm/nestjs-sns/dist/sns.types";
import {ActivityType} from "../../shared/queue/activity-type";
import { v4 as uuidv4 } from 'uuid';
import {ActivityMessageDto} from "../../shared/queue/activity-message.dto";
import {ConfigService} from "@nestjs/config";


@Injectable()
export class QueueService {
    constructor(
        private readonly logger: AppLogger,
        private readonly snsService: SnsService,
        private readonly configService: ConfigService,
    ) {
        this.logger.setContext(QueueService.name);
    }

    public async publishActivity<T>(
        ctx: RequestContext,
        activityType: ActivityType,
        body: T,
    ): Promise<snsTypes.PublishResponse> {
        this.logger.log(ctx,`${this.publishActivity.name} was called`);

        const message = {
            activityType: activityType,
            message: body,
        } as ActivityMessageDto<T>;

        const snsResponse: snsTypes.PublishResponse = await this.snsService.publish({
            MessageGroupId: `${activityType}-${uuidv4()}`,
            MessageDeduplicationId: uuidv4(),
            Message: JSON.stringify(message),
            TopicArn: this.configService.get<string>("aws.sns.activityArn"),
        });

        this.logger.log(ctx,`${this.publishActivity.name} snsResponse: ${JSON.stringify(snsResponse)}`);
        return snsResponse;
    }
}
