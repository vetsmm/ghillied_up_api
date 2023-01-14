import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class GhillieMemberSettingsUpdateDto {
    @IsOptional()
    @IsBoolean()
    @ApiPropertyOptional()
    readonly newPostNotifications?: boolean;
}
