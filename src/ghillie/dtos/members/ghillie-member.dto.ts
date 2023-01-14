import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { GhillieRole, MemberStatus } from '@prisma/client';

export class GhillieMemberDto {
    @ApiProperty()
    @Expose()
    ghillieId: string;

    @ApiProperty()
    @Expose()
    userId: string;

    @ApiProperty()
    @Expose()
    joinDate: Date;

    @ApiProperty()
    @Expose()
    memberStatus: MemberStatus;

    @ApiProperty()
    @Expose()
    role: GhillieRole;

    @ApiProperty()
    @Expose()
    newPostNotifications?: boolean;
}
