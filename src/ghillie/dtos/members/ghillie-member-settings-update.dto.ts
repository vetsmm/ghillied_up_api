import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class GhillieMemberSettingsUpdateDto {
    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    newPostNotifications?: boolean;
}
