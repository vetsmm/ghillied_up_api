import { ApiProperty } from '@nestjs/swagger';
import { CommentStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly content?: string;

  @ApiProperty()
  @IsEnum(CommentStatus)
  @IsOptional()
  readonly status?: CommentStatus;
}
