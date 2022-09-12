import { ApiProperty } from '@nestjs/swagger';
import { ReactionType } from '@prisma/client';
import { Expose, Type } from 'class-transformer';
import { CommentDetailDto } from '../../posts';

export class CommentReactionSubsetDto {
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
  @Type(() => CommentDetailDto)
  comment?: CommentDetailDto;

  @ApiProperty()
  @Expose()
  commentId?: string;
}
