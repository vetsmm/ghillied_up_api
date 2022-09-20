import {Module} from "@nestjs/common";
import {AppLogger} from "../shared";
import {NotificationService} from "./services/notification.service";
import {NotificationController} from "./controller/notification.controller";
import {PrismaService} from "../prisma/prisma.service";

@Module({
    providers: [
        AppLogger,
        PrismaService,
        NotificationService
    ],
    controllers: [NotificationController],
    exports: [NotificationService],
})
export class NotificationModule {
}
