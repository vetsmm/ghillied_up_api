import { ApiProperty } from '@nestjs/swagger';
import { ReactionType } from '@prisma/client';
import { Expose, Type } from 'class-transformer';
import { CommentDetailDto, PostUserMetaDto } from '../../posts';

export class CommentReactionDetailsDto {
  @ApiProperty()
  @Expose()
  reactionType: ReactionType;

  @ApiProperty()
  @Expose()
  commentId: string;

  @ApiProperty()
  @Expose()
  @Type(() => CommentDetailDto)
  comment?: CommentDetailDto;

  @ApiProperty()
  @Expose()
  @Type(() => PostUserMetaDto)
  postedBy: PostUserMetaDto;
}
