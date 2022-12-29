import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
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
    @IsBoolean()
    readOnly: boolean;

    @ApiProperty({
        type: [String],
    })
    @IsArray()
    readonly topicNames?: string[] = [];

    @ApiProperty({
        type: Boolean,
    })
    @IsBoolean()
    adminInviteOnly: boolean;

    @ApiProperty({
        type: Boolean,
    })
    @IsBoolean()
    isPrivate: boolean;

    @ApiProperty()
    @IsEnum(GhillieCategory)
    readonly category: GhillieCategory;
}
