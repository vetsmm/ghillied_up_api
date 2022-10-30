import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
    HasMimeType,
    IsFile,
    MaxFileSize,
    MemoryStoredFile,
} from 'nestjs-form-data';
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

    @IsFile()
    @MaxFileSize(1e6)
    @HasMimeType(['image/jpeg', 'image/png'])
    @IsOptional()
    @ApiProperty({ type: 'string', format: 'binary', required: false })
    ghillieLogo?: MemoryStoredFile;

    @ApiProperty({
        description: 'Ghillie topicNames',
        example: ['topic1', 'topic2'],
    })
    @IsArray()
    @IsOptional()
    topicNames?: string[];
}
