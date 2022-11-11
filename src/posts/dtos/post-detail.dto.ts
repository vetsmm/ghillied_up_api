import { ApiProperty } from '@nestjs/swagger';
import {
    PostStatus,
    ReactionType,
    ServiceBranch,
    ServiceStatus,
} from '@prisma/client';
import { Expose, Transform, Type } from 'class-transformer';
import { LinkMeta } from '../../open-graph/dtos/link-meta';

export class PostGhillieMetaDto {
    @ApiProperty()
    @Expose()
    id: string;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty()
    @Expose()
    imageUrl: string;
}

export class PostUserMetaDto {
    @ApiProperty()
    @Expose()
    username: string;

    @ApiProperty()
    @Expose()
    branch: ServiceBranch;

    @ApiProperty()
    @Expose()
    serviceStatus: ServiceStatus;

    @ApiProperty()
    @Expose()
    slug: string;
}

export class PostDetailDto {
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
    @Type(() => PostGhillieMetaDto)
    ghillie: PostGhillieMetaDto;

    @ApiProperty()
    @Expose()
    @Type(() => PostUserMetaDto)
    postedBy: PostUserMetaDto;

    @ApiProperty()
    @Expose()
    createdDate: Date;

    @ApiProperty()
    @Expose()
    updatedDate: Date;

    @ApiProperty()
    @Expose()
    edited: boolean;

    @ApiProperty()
    @Expose()
    tags: string[];

    @ApiProperty()
    @Expose()
    @Transform((value) => value.obj._count?.postComments, { toClassOnly: true })
    numberOfComments?: number = 0;

    @ApiProperty()
    @Expose()
    @Transform((value) => value.obj._count?.postReaction, { toClassOnly: true })
    numberOfReactions?: number = 0;

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
    currentUserReaction?: ReactionType = null;

    @ApiProperty()
    @Expose()
    linkMeta?: LinkMeta;
}
