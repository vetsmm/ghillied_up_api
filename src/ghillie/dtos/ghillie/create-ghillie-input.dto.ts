import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ToBoolean } from '../../../shared';
import { GhillieCategory } from '@prisma/client';

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

    @ApiProperty({
        type: Boolean,
    })
    @ToBoolean()
    readonly adminInviteOnly: boolean = false;

    @ApiProperty({
        type: Boolean,
    })
    @ToBoolean()
    readonly isPrivate: boolean = false;

    @ApiProperty()
    @IsEnum(GhillieCategory)
    readonly category: GhillieCategory;
}
