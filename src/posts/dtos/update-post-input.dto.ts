import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PostStatus } from '@prisma/client';

export class UpdatePostInputDto {
  @ApiProperty()
  @IsString()
  @MaxLength(400)
  @IsOptional()
  content?: string;

  @ApiProperty()
  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;
}
