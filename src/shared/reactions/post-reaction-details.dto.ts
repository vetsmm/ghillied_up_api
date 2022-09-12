import { ApiProperty } from '@nestjs/swagger';
import { ReactionType } from '@prisma/client';
import { Expose, Type } from 'class-transformer';
import { PostDetailDto, PostUserMetaDto } from '../posts';

export class PostReactionDetailsDto {
  @ApiProperty()
  @Expose()
  reactionType: ReactionType;

  @ApiProperty()
  @Expose()
  postId: string;

  @ApiProperty()
  @Expose()
  @Type(() => PostDetailDto)
  post?: string;

  @ApiProperty()
  @Expose()
  @Type(() => PostUserMetaDto)
  postedBy: PostUserMetaDto;
}
