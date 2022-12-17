import { PostStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePostInputDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    @MaxLength(1000)
    content: string;

    @ApiProperty()
    @IsEnum(PostStatus)
    @IsOptional()
    status?: PostStatus;

    @ApiProperty()
    @IsString()
    ghillieId: string;
}
