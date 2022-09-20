import {ApiProperty} from "@nestjs/swagger";
import {IsArray} from "class-validator";

export class ReadNotificationsInputDto {
    @ApiProperty()
    @IsArray()
    notificationIds: string[];
}
