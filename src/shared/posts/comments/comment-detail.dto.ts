import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { CommentStatus, ReactionType } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { PostUserMetaDto } from '../post-detail.dto';

export class CommentDetailDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  content: string;

  @ApiProperty()
  @Expose()
  @IsEnum(CommentStatus)
  status: CommentStatus;

  @ApiProperty()
  @Expose()
  createdDate: Date;

  @ApiProperty()
  @Expose()
  updatedDate: Date;

  @ApiProperty()
  @Expose()
  @Type(() => PostUserMetaDto)
  createdBy: PostUserMetaDto;

  @ApiProperty()
  @Expose()
  edited: boolean;

  @ApiProperty()
  @Expose()
  postId: string;

  @ApiProperty()
  @Expose()
  commentHeight: number;

  @ApiProperty()
  @Expose()
  childCommentIds: string[];

  @ApiProperty()
  @Expose()
  @Transform((value) => value.obj.childCommentIds.length, { toClassOnly: true })
  numberOfChildComments?: number = 0;

  @ApiProperty()
  @Expose()
  @Transform(
    (value) => {
      return value.obj.commentReaction !== undefined &&
        value.obj.commentReaction.length > 0
        ? value.obj.commentReaction.reactionType
        : null;
    },
    { toClassOnly: true },
  )
  currentUserReaction?: ReactionType = null;

  @ApiProperty()
  @Expose()
  @Transform(
    (value) => {
      return (
        value.obj.commentReaction !== undefined &&
        value.obj.commentReaction.length > 0
      );
    },
    { toClassOnly: true },
  )
  likedByCurrentUser?: boolean = false;

  @ApiProperty()
  @Expose()
  @Transform((value) => value.obj._count?.commentReaction, {
    toClassOnly: true,
  })
  numberOfReactions?: number = 0;
}
