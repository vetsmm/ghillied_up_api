import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger, RequestContext } from '../../shared';
import { NEST_PGPROMISE_CONNECTION } from 'nestjs-pgpromise';
import { IDatabase } from 'pg-promise';
import { PushNotificationSettings } from '@prisma/client';

@Injectable()
export class PushNotificationRepository {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: AppLogger,
        @Inject(NEST_PGPROMISE_CONNECTION) private readonly pg: IDatabase<any>,
    ) {
        this.logger.setContext(PushNotificationRepository.name);
    }

    async getPushNotificationSettingsForUsers(
        ctx: RequestContext,
        toUserIds: string[],
        limit: number,
        offset: number,
    ): Promise<PushNotificationSettings[]> {
        this.logger.debug(
            ctx,
            `${this.getPushNotificationSettingsForUsers.name} was called`,
        );

        return this.prisma.pushNotificationSettings.findMany({
            where: {
                userId: {
                    in: toUserIds,
                },
            },
            take: limit,
            skip: offset,
        });
    }

    async getPushTokensForUsers(
        ctx: RequestContext,
        userIds: string[],
        limit: number,
        offset: number,
    ): Promise<Map<string, string[]>> {
        return this.prisma.devicePushToken
            .findMany({
                where: {
                    userId: {
                        in: userIds,
                    },
                    isDisabled: false,
                },
                take: limit,
                skip: offset,
            })
            .then((tokens) => {
                const map = new Map<string, string[]>();
                tokens.forEach((token) => {
                    if (map.has(token.userId)) {
                        map.get(token.userId).push(token.token);
                    } else {
                        map.set(token.userId, [token.token]);
                    }
                });
                return map;
            });
    }

    async disablePushToken(
        ctx: RequestContext,
        token: string,
        userId: string,
    ): Promise<void> {
        this.prisma.devicePushToken
            .update({
                where: {
                    token_userId: {
                        token,
                        userId,
                    },
                },
                data: {
                    isDisabled: true,
                },
            })
            .then(() => {
                this.logger.debug(
                    ctx,
                    `Disabled push token: ${token} for user: ${userId}`,
                );
            })
            .catch((err) => {
                this.logger.error(
                    ctx,
                    `Error disabling push token: ${token} for user: ${userId} - ${err}`,
                );
            });
    }

    public async getPushTokensForUser(
        ctx: RequestContext,
        toUserId?: string,
    ): Promise<string[]> {
        this.logger.log(ctx, `${this.getPushTokensForUser.name} was called`);

        if (!toUserId) {
            this.logger.log(
                ctx,
                `${this.getPushTokensForUser.name} toUserId is null, not sending push notification`,
            );
            return [];
        }
        return this.prisma.devicePushToken
            .findMany({
                where: {
                    userId: toUserId,
                    isDisabled: false,
                },
            })
            .then((tokens) => tokens.map((token) => token.token));
    }

    public async getPushNotificationSettingsForUser(
        ctx: RequestContext,
        toUserId?: string,
    ): Promise<PushNotificationSettings> {
        this.logger.log(
            ctx,
            `${this.getPushNotificationSettingsForUser.name} was called`,
        );

        if (!toUserId) {
            this.logger.log(
                ctx,
                `${this.getPushNotificationSettingsForUser.name} toUserId is null, not sending push notification`,
            );
            return null;
        }

        return this.prisma.pushNotificationSettings.findUnique({
            where: {
                userId: toUserId,
            },
        });
    }
}
