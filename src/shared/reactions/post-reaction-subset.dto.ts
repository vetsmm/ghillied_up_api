import { ApiProperty } from '@nestjs/swagger';
import { ReactionType } from '@prisma/client';
import { Expose, Type } from 'class-transformer';
import { PostDetailDto } from '../posts';

export class PostReactionSubsetDto {
  @ApiProperty()
  @Expose()
  reactions: {
    [key in ReactionType]: number;
  };

  @ApiProperty()
  @Expose()
  totalReactions: number;

  @ApiProperty()
  @Expose()
  @Type(() => PostDetailDto)
  post?: string;

  @ApiProperty()
  @Expose()
  postId?: string;
}
