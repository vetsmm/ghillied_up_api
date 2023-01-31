import { ApiProperty } from '@nestjs/swagger';
import { MfaMethod, UserAuthority, UserStatus } from '@prisma/client';
import { Expose } from 'class-transformer';
import { BaseUserOutputDto } from '../base-user-output.dto';

export class UserOutput extends BaseUserOutputDto {
    @Expose()
    @ApiProperty()
    id: string;

    @Expose()
    @ApiProperty()
    username: string;

    @Expose()
    @ApiProperty()
    firstName: string;

    @Expose()
    @ApiProperty()
    lastName: string;

    @Expose()
    @ApiProperty({ example: [UserAuthority.ROLE_USER] })
    authorities: UserAuthority[];

    @Expose()
    @ApiProperty()
    email: string;

    @Expose()
    @ApiProperty()
    activated: boolean;

    @Expose()
    @ApiProperty()
    status: UserStatus;

    @Expose()
    @ApiProperty()
    createdDate: string;

    @Expose()
    @ApiProperty()
    updatedDate: string;

    @Expose()
    @ApiProperty()
    checkLocationOnLogin: boolean;

    @Expose()
    @ApiProperty()
    timezone: string;

    @Expose()
    @ApiProperty()
    phoneNumber: string;

    @Expose()
    @ApiProperty()
    twoFactorMethod: MfaMethod;

    @Expose()
    @ApiProperty()
    phoneNumberConfirmed: boolean;
}
