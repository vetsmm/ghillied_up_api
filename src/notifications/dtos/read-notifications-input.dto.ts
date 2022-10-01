import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class NotificationIdsDto {
    @ApiProperty()
    activityId: string;

    @ApiProperty()
    id: string;
}

export class ReadNotificationsInputDto {
    @ApiProperty()
    @IsArray()
    ids: NotificationIdsDto[];
}
