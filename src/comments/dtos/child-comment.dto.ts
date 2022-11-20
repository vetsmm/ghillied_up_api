import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { CommentStatus, ReactionType } from '@prisma/client';
import { PostUserMetaDto } from '../../shared';

export class ChildCommentDto {
    @ApiProperty()
    @Expose()
    parentId?: string;

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
    updatedDate?: Date;

    @ApiProperty()
    @Expose()
    @Type(() => PostUserMetaDto)
    createdBy: PostUserMetaDto;

    @ApiProperty()
    @Expose()
    edited: boolean;

    @ApiProperty()
    @Expose()
    currentUserReaction?: ReactionType = null;

    @ApiProperty()
    @Expose()
    numberOfReactions?: number = 0;
}
