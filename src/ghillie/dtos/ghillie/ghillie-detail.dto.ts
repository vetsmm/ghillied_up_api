import { ApiProperty } from '@nestjs/swagger';
import { GhillieStatus } from '@prisma/client';
import { Expose, Transform, Type } from 'class-transformer';
import { TopicLiteOutputDto } from '../topic/topic-lite-output.dto';
import { GhillieMemberDto } from '../members/ghillie-member.dto';

export class GhillieDetailDto {
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
  @Transform((value) => value.obj._count?.members, { toClassOnly: true })
  totalMembers?: number;

  @ApiProperty()
  @Expose()
  lastPostDate?: Date;

  @ApiProperty()
  @Expose()
  @Transform(
    (value) => {
      return value.obj.members !== undefined && value.obj.members.length > 0
        ? {
            joinDate: value.obj.members[0].joinDate,
            memberStatus: value.obj.members[0].memberStatus,
            role: value.obj.members[0].role,
          }
        : null;
    },
    { toClassOnly: true },
  )
  memberMeta?: GhillieMemberDto | null;
}
