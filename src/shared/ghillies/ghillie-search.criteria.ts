import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { GhillieStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class GhillieSearchCriteria {
    @IsNumber()
    @Type(() => Number)
    take = 25;

    @IsString()
    @IsOptional()
    cursor?: string;

    @ApiProperty()
    @IsOptional()
    name?: string;

    @ApiProperty()
    @IsOptional()
    slug?: string;

    @ApiProperty()
    @IsOptional()
    about?: string;

    @ApiProperty()
    @IsOptional()
    status?: GhillieStatus = GhillieStatus.ACTIVE;

    @ApiProperty()
    @IsOptional()
    readonly?: boolean;

    @ApiProperty()
    @IsOptional()
    topicIds?: Array<string>;
}
