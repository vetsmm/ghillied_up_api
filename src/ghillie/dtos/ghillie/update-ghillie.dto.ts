import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GhillieCategory } from '@prisma/client';

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
    @IsBoolean()
    @IsOptional()
    readOnly?: boolean;

    @ApiProperty({
        type: [String],
        description: 'Ghillie topicNames',
        example: ['topic1', 'topic2'],
    })
    @IsArray()
    @IsOptional()
    topicNames?: string[] = [];

    @ApiProperty({
        type: Boolean,
    })
    @IsBoolean()
    @IsOptional()
    readonly adminInviteOnly?: boolean;

    @ApiProperty({
        type: Boolean,
    })
    @IsBoolean()
    @IsOptional()
    readonly isPrivate?: boolean;

    @ApiProperty()
    @IsEnum(GhillieCategory)
    @IsOptional()
    readonly category?: GhillieCategory;
}
