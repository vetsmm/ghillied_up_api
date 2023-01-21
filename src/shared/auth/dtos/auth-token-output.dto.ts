import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { UserAuthority } from '@prisma/client';

export class AuthTokenOutput {
    @Expose()
    @ApiProperty()
    accessToken: string;

    @Expose()
    @ApiProperty()
    refreshToken: string;
}

export class UserAccessTokenClaims {
    @Expose()
    id: string;
    @Expose()
    username: string;
    @Expose()
    authorities: UserAuthority[];
    @Expose()
    sessionId?: string;
}

export class UserRefreshTokenClaims {
    id: number;
}
