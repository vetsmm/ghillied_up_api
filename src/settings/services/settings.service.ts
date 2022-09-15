import {Injectable} from "@nestjs/common";
import {PrismaService} from "../../prisma/prisma.service";
import {AppLogger, RequestContext} from "../../shared";
import {DeviceTokenInputDto} from "../dtos/device-token-input.dto";

@Injectable()
export class SettingsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: AppLogger,
    ) {
        this.logger.setContext(SettingsService.name);
    }

    async createDeviceToken(ctx: RequestContext, input: DeviceTokenInputDto): Promise<void> {
        this.logger.log(ctx, `${this.createDeviceToken.name} was called`);

        // If device token already exists, do nothing, otherwise create it
        const deviceToken = await this.prisma.devicePushToken.findUnique({
            where: {
                token: input.deviceToken,
            }
        });

        if (!deviceToken) {
            this.logger.log(ctx, `Creating new device token for user ${ctx.user.id}`);
            await this.prisma.devicePushToken.create({
                data: {
                    token: input.deviceToken,
                    platform: input.phonePlatform,
                    user: {
                        connect: {
                            id: ctx.user.id,
                        }
                    }
                }
            });
        }
    }
}
