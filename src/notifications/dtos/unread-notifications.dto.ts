import {Expose} from "class-transformer";

export class UnreadNotificationsDto {
    @Expose()
    public readonly unreadCount: number;
}
