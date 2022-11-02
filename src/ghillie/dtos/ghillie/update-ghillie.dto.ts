import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ToBoolean } from '../../../shared';

export class UpdateGhillieDto {
    @ApiProperty({
        description: 'Ghillie name',
        example: 'Hello world',
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        description: 'Ghillie about',
        example: 'Hello world',
    })
    @IsString()
    @IsOptional()
    about?: string | null;

    @ApiProperty({
        type: Boolean,
    })
    @ToBoolean()
    @IsOptional()
    readOnly?: boolean;

    @ApiProperty({
        description: 'Ghillie topicNames',
        example: ['topic1', 'topic2'],
    })
    @IsArray()
    @IsOptional()
    topicNames?: string[];
}
