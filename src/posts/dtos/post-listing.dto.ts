import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { PostStatus, ReactionType } from '@prisma/client';
import { PostGhillieMetaDto, PostUserMetaDto } from './post-detail.dto';

export class PostListingDto {
    @ApiProperty()
    @Expose()
    id: string;

    @ApiProperty()
    @Expose()
    uid: string;

    @ApiProperty()
    @Expose()
    title: string;

    @ApiProperty()
    @Expose()
    content: string;

    @ApiProperty()
    @Expose()
    status: PostStatus;

    @ApiProperty()
    @Expose()
    @Type(() => PostUserMetaDto)
    postedBy: PostUserMetaDto;

    @ApiProperty()
    @Expose()
    createdDate: Date;

    @ApiProperty()
    @Expose()
    edited: boolean;

    @ApiProperty()
    @Expose()
    @Type(() => PostGhillieMetaDto)
    ghillie?: PostGhillieMetaDto;

    @ApiProperty()
    @Expose()
    isPinned: boolean;

    @ApiProperty()
    @Expose()
    @Transform((value) => value.obj._count?.postComments, { toClassOnly: true })
    numberOfComments = 0;

    @ApiProperty()
    @Expose()
    @Transform((value) => value.obj._count?.postReaction, { toClassOnly: true })
    numberOfReactions = 0;

    @ApiProperty()
    @Expose()
    @Transform(
        (value) => {
            return value.obj.postReaction !== undefined &&
                value.obj.postReaction.length > 0
                ? value.obj.postReaction.reactionType
                : null;
        },
        { toClassOnly: true },
    )
    currentUserReaction: ReactionType = null;
}
