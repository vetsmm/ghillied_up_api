import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CommentStatus, ReactionType } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { PostUserMetaDto } from '../../shared';
import { ChildCommentDto } from './child-comment.dto';

export class ParentCommentDto {
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
    commentReplyCount?: number = 0;

    @ApiProperty()
    @Expose()
    currentUserReaction?: ReactionType = null;

    @ApiProperty()
    @Expose()
    numberOfReactions?: number = 0;

    @ApiProperty()
    @Expose()
    latestChildComments?: ChildCommentDto[] = [];
}
