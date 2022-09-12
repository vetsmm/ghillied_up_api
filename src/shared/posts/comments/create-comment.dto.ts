import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  readonly content: string;

  @ApiProperty()
  @IsString()
  readonly postId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly parentCommentId?: string;
}
