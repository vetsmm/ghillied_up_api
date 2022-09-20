import {IsBoolean, IsEnum, IsNumber, IsOptional, IsString} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from "@prisma/client";

export class NotificationInputDto {
    @ApiProperty()
    @IsString()
    @IsOptional()
    cursor?: string;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    take?: number = 25;

    @ApiProperty()
    @IsEnum(NotificationType)
    @IsOptional()
    type?: NotificationType;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    read?: boolean;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    trash?: boolean = false;

    @ApiProperty()
    @IsString()
    @IsOptional()
    orderBy?: 'asc' | 'desc' = 'desc';
}
