import {Expose} from "class-transformer";

export class UnreadNotificationsDto {
    @Expose()
    unreadCount: number;
}
