import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserOutput } from '../../user/dtos/public/user-output.dto';

export class ApprovedSubnetDto {
    @ApiProperty()
    @Expose()
    createdDate: Date;
    @ApiProperty()
    @Expose()
    id: string;
    @ApiProperty()
    @Expose()
    subnet: string;
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
    updatedDate: Date;
    @ApiProperty()
    @Expose()
    userId: string;

    @ApiProperty()
    @Expose()
    @Type(() => UserOutput)
    user: UserOutput;
}
