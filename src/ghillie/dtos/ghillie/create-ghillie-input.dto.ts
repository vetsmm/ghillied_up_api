import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ToBoolean } from '../../../shared';
import {
    HasMimeType,
    IsFile,
    MaxFileSize,
    MemoryStoredFile,
} from 'nestjs-form-data';

export class CreateGhillieInputDto {
    @IsNotEmpty()
    @ApiProperty()
    @IsString()
    name: string;

    @IsOptional()
    @ApiProperty({ required: false })
    @IsString()
    about?: string | null;

    @ApiProperty({
        type: Boolean,
    })
    @ToBoolean()
    readOnly: boolean;

    @ApiProperty({
        type: [String],
    })
    @IsArray()
    readonly topicNames?: string[] = [];

    @IsFile()
    @MaxFileSize(1e6)
    @HasMimeType(['image/jpeg', 'image/png'])
    @IsOptional()
    @ApiProperty({ type: 'string', format: 'binary', required: false })
    ghillieLogo?: MemoryStoredFile;
}
