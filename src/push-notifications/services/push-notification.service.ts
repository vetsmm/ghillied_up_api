import { Inject, Injectable } from '@nestjs/common';
import { AppLogger, chunkify, RequestContext } from '../../shared';
import { NEST_PGPROMISE_CONNECTION } from 'nestjs-pgpromise';
import { IDatabase } from 'pg-promise';
import * as firebase from 'firebase-admin';
import { mapLimit } from 'async';
import {
    IFirebaseMessageDto,
    ISendFirebaseMessageDto,
} from '../dtos/firebase-message.dto';
import { PushNotificationRepository } from '../repository/push-notification.repository';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PushNotificationService {
    constructor(
        private readonly logger: AppLogger,
        private readonly pushNotificationRepository: PushNotificationRepository,
        private readonly configService: ConfigService,
        @Inject(NEST_PGPROMISE_CONNECTION) private readonly pg: IDatabase<any>,
    ) {
        this.logger.setContext(PushNotificationService.name);
    }

    private async sendFirebaseMessages(
        ctx: RequestContext,
        firebaseMessages: ISendFirebaseMessageDto[],
        dryRun?: boolean,
    ): Promise<firebase.messaging.BatchResponse> {
        const batchedFirebaseMessages = chunkify(firebaseMessages, 500);

        const batchResponses = await mapLimit<
            ISendFirebaseMessageDto[],
            firebase.messaging.BatchResponse
        >(
            batchedFirebaseMessages,
            3, // 3 is a good place to start
            async (
                groupedFirebaseMessages: ISendFirebaseMessageDto[],
            ): Promise<firebase.messaging.BatchResponse> => {
                try {
                    const tokenMessages: firebase.messaging.TokenMessage[] =
                        groupedFirebaseMessages.map(
                            ({ message, title, token, imageUrl, data }) => ({
                                notification: {
                                    body: message,
                                    title,
                                    imageUrl: imageUrl,
                                },
                                data,
                                token,
                                apns: {
                                    payload: {
                                        aps: {
                                            'content-available': 1,
                                        },
                                    },
                                },
                            }),
                        );

                    return firebase.messaging().sendAll(tokenMessages, dryRun);
                } catch (error) {
                    this.logger.log(
                        ctx,
                        `An Error Occurred Sending to Firebase: ${error}`,
                    );
                    return {
                        responses: groupedFirebaseMessages.map(() => ({
                            success: false,
                            error,
                        })),
                        successCount: 0,
                        failureCount: groupedFirebaseMessages.length,
                    };
                }
            },
        );

        return batchResponses.reduce(
            ({ responses, successCount, failureCount }, currentResponse) => {
                return {
                    responses: responses.concat(currentResponse.responses),
                    successCount: successCount + currentResponse.successCount,
                    failureCount: failureCount + currentResponse.failureCount,
                };
            },
            {
                responses: [],
                successCount: 0,
                failureCount: 0,
            } as unknown as firebase.messaging.BatchResponse,
        );
    }

    public async pushToUser(
        ctx: RequestContext,
        userId: string,
        firebaseMessage: IFirebaseMessageDto,
        dryRun?: boolean,
    ): Promise<firebase.messaging.BatchResponse> {
        if (ctx.user.id === userId) {
            this.logger.debug(
                ctx,
                `${this.pushToUser.name} userId is same as fromUserId, not sending push notification`,
            );
            return null;
        }

        const userTokens =
            await this.pushNotificationRepository.getPushTokensForUser(
                ctx,
                userId,
            );

        const firebaseMessages = userTokens.map((token) => ({
            ...firebaseMessage,
            token,
        }));

        return this.sendFirebaseMessages(ctx, firebaseMessages, dryRun);
    }
}
