import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserOutput } from '../../user/dtos/public/user-output.dto';

export class SessionDto {
    @ApiProperty()
    @Expose()
    createdDate: Date;

    @ApiProperty()
    @Expose()
    id: string;

    @ApiProperty()
    @Expose()
    ipAddress: string;

    @ApiProperty()
    @Expose()
    token: string;

    @ApiProperty()
    @Expose()
    updatedDate: Date;

    @ApiProperty()
    @Expose()
    userAgent: string | null;

    @ApiProperty()
    @Expose()
    city: string | null;

    @ApiProperty()
    @Expose()
    region: string | null;

    @ApiProperty()
    @Expose()
    timezone: string | null;

    @ApiProperty()
    @Expose()
    countryCode: string | null;

    @ApiProperty()
    @Expose()
    browser: string | null;

    @ApiProperty()
    @Expose()
    operatingSystem: string | null;
    @ApiProperty()
    @Expose()
    userId: string;

    @ApiProperty()
    @Expose()
    @Type(() => UserOutput)
    user: UserOutput;

    @ApiProperty()
    @Expose()
    isCurrentSession: boolean;
}
