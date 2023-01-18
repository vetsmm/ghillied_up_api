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

@Injectable()
export class PushNotificationService {
    constructor(
        private readonly logger: AppLogger,
        private readonly pushNotificationRepository: PushNotificationRepository,
        @Inject(NEST_PGPROMISE_CONNECTION) private readonly pg: IDatabase<any>,
    ) {
        this.logger.setContext(PushNotificationService.name);

        firebase.initializeApp({
            credential: firebase.credential.cert({
                projectId: 'ghillied-up',
                clientEmail:
                    'firebase-adminsdk-w79m0@ghillied-up.iam.gserviceaccount.com',
                privateKey:
                    '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCt/qYKJS2kbyEm\nR2At81avfyuqHREtrp/+0+ZxIy9ToYMlvJ7/cJrbCDbpQWS73QhB/MwPKpPrWpEc\n58Ucj179xVrKfH1YyE9DcAsOmcbGvtrJeLhPhmOcNm4AAihH5n7fPstuWm9kllbK\nq95ZGDvqCNyGXxNbZYppKHCumscGDfc3LOlrdNIpLTdkA5LhwEeMcoaOfRkd3/CR\n4dp+EZwWeh3qD+P7GjSil5AEmP6lIdzes8rUVOGrh7u5TIYKRZuftxUaQgO0GnK9\nqbOVnUfMX2t/BYE2zWoVLrVcDsFvF+sjwfJn28AfsideTy5o3XdxMJ96RsjR6kJw\nklw88aYJAgMBAAECggEADwdU444LIrRZZygfT4JaUiWuwyG1ANg5lQLljFxb828B\nPnDleBSlJr0cM33Ey/gPOG/m8K2egcopVZdS7odKghEaKS1wJqTqn8Pdcjq0sVvK\nPXO4nvnX81kjzpfHgrcoh0AYkmTfHg+UQJFwaHHc68QtlBeoB6sK6QL0TkiR+Nyq\nE/ZjNo0EBIH+GgplVzjXeJLO9rLmcf457HMsZ2L0eY4brlK+Ex5qqk4PIA3/Zf90\nsPHnS3m3JtqAU7gwJomjkg95njwp30V2pFVrM+bNfQ4xTd2N152WVU0Uw2yLQOaT\nT7nxcyc2T1+dTsVRy+9Cc7Mxh99TyHyzGRa2txPRhwKBgQDYbQ57cdORbZEJeHew\nF3f3lAO9AdEuKveaQOostplq3IGyPEJ7Mk3nxHZxeZCivyn9NObv9O6fl4QHcLYt\nyExMWxkxGCEAl806sajCI2X5hlkDaozZ4kwk/NQUttDd/mxIoJ2asjOds2tAcOPP\n2NCOfocww4KBEF/iEvbm2ZGR2wKBgQDNz2AeYi154agZmpvmjU/pDHxuAtbWhFTY\n21AJBBzCjbi+VDwpx6imnSnzQQSTamU/psCaGoncn7WTcy271wmXBm57s/k4GkGC\ng1RHy84BpdHNwTFqkqoE5UJaU4j5mjiVjQxPxd8Pj4YEhKk974LsPfZhP2wYZ975\nKQiiQ7Lm6wKBgGzno8v2YTHi4oLTfda8WH/amW74hRwoPuP+GlhZoiWlxBW+QO3h\nSFaCA9/h/igG7cgeYL8KjzD7e1KLIwEys0IQ7UJJFAJKYNlSIMtgKKZBNnWDnlDd\nkNdj6gxqWfv7VN3PBL+dQF/wst2AcQJb5cZuYPTmzLrJVJZcWKWdgaTVAoGBAI51\noR7m7nuTS3yNnKR15H54ehjcNkG+z8xb4oabJh01ZE+6lvqEjaTm3QbYVoaD+xmY\nH3GMNSlWE6XA8EM5khXMCeXuqe+/nODubwRTeoGBejxmIgKXCsDgwJEtiX7c1ZYP\nUBpX6RMoUagG++83PvSv3z9pWzV5kMn/MU7AdbGJAoGAeapCSuzrrM0BzOWHh3l+\nym6nxvOQMZnBo8OtztLawV45RwwswMPiNJF12ob6b5lRprYXELSqslyWeVD6nC1v\nNQvtmTXDIkSPEh3o3Y1aIRh64R3kCyn75UPcCbVkN0/PSDa2sqwQDc9+sUX3MtPI\n54pshCUxy+wDnvTQ0vDP79k=\n-----END PRIVATE KEY-----\n',
            }),
        });
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
