import { PostStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePostInputDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  @MaxLength(800)
  content: string;

  @ApiProperty()
  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @ApiProperty()
  @IsString()
  ghillieId: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  postTagNames?: string[];
}
