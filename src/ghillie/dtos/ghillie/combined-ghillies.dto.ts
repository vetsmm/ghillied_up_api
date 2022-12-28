import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TopicLiteOutputDto } from '../topic/topic-lite-output.dto';
import { GhillieCategory, GhillieStatus } from '@prisma/client';
import { GhillieMemberDto } from '../members/ghillie-member.dto';

class GhillieDetailDto {
    @ApiProperty()
    @Expose()
    id: string;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty()
    @Expose()
    slug: string;

    @ApiProperty()
    @Expose()
    about: string | null;

    @ApiProperty()
    @Expose()
    readOnly: boolean;

    @ApiProperty()
    @Expose()
    imageUrl: string | null;

    @ApiProperty()
    @Expose()
    @Type(() => TopicLiteOutputDto)
    topics: TopicLiteOutputDto[];

    @ApiProperty()
    @Expose()
    ownerUsername?: string;

    @ApiProperty()
    @Expose()
    status: GhillieStatus;

    @ApiProperty()
    @Expose()
    createdAt: Date;

    @ApiProperty()
    @Expose()
    updatedAt: Date;

    @ApiProperty()
    @Expose()
    totalMembers?: number;

    @ApiProperty()
    @Expose()
    postCount?: number;

    @ApiProperty()
    @Expose()
    lastPostDate?: Date;

    @ApiProperty()
    @Expose()
    @Transform(
        (value) => {
            return value.obj?.memberMeta?.length > 0
                ? {
                      joinDate: value.obj.memberMeta[0]?.join_date,
                      memberStatus: value.obj.memberMeta[0]?.member_status,
                      role: value.obj.memberMeta[0]?.role,
                  }
                : null;
        },
        { toClassOnly: true },
    )
    memberMeta?: GhillieMemberDto | null;

    @ApiProperty()
    @Expose()
    adminInviteOnly?: boolean;

    @ApiProperty()
    @Expose()
    isPrivate?: boolean;

    @ApiProperty()
    @Expose()
    category?: GhillieCategory;

    @ApiProperty()
    @Expose()
    inviteCode?: string;
}

export class CombinedGhilliesDto {
    @ApiProperty()
    @Expose()
    @Type(() => GhillieDetailDto)
    users: GhillieDetailDto[];
    @ApiProperty()
    @Expose()
    @Type(() => GhillieDetailDto)
    popularByMembers: GhillieDetailDto[];
    @ApiProperty()
    @Expose()
    @Type(() => GhillieDetailDto)
    popularByTrending: GhillieDetailDto[];
    @ApiProperty()
    @Expose()
    @Type(() => GhillieDetailDto)
    newest: GhillieDetailDto[];
    @ApiProperty()
    @Expose()
    @Type(() => GhillieDetailDto)
    internal: GhillieDetailDto[];
    @ApiProperty()
    @Expose()
    @Type(() => GhillieDetailDto)
    promoted: GhillieDetailDto[];
    @ApiProperty()
    @Expose()
    @Type(() => GhillieDetailDto)
    sponsored: GhillieDetailDto[];
}
