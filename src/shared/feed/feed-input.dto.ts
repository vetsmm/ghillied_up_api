import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FeedFilters } from './feed.filters';

export class FeedInputDto {
    @ApiProperty()
    @IsString()
    @IsOptional()
    cursor?: string;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    take?: number = 25;

    @ApiProperty()
    @IsObject()
    @IsOptional()
    filters?: FeedFilters;

    @ApiProperty()
    @IsString()
    @IsOptional()
    orderBy?: 'asc' | 'desc' = 'desc';
}
