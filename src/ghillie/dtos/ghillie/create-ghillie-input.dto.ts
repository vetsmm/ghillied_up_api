import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ToBoolean } from '../../../shared';

export class CreateGhillieInputDto {
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
}
