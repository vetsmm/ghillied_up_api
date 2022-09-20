import {Expose} from "class-transformer";
import {NotificationType} from "@prisma/client";

export class NotificationDto {
    @Expose()
    id: string

    @Expose()
    type: NotificationType

    @Expose()
    message: string | null

    @Expose()
    read: boolean

    @Expose()
    trash: boolean

    @Expose()
    createdDate: Date

    @Expose()
    updatedDate: Date

    @Expose()
    fromUserId: string | null

    @Expose()
    toUserId: string

    @Expose()
    sourceId: string
}
