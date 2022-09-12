import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, Max } from 'class-validator';
import { PostStatus } from '@prisma/client';
import { PaginationParamsDto } from '../dtos';

export class PostSearchCriteria extends PaginationParamsDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Max(255)
  content?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus = PostStatus.ACTIVE;

  @ApiProperty()
  @IsString()
  ghillieId: string; // required to prevent unauthorized access

  @ApiProperty()
  @IsOptional()
  @IsArray()
  tags?: Array<string>;
}
