import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AuthIdMeVerifyResultDto {
    @ApiProperty()
    @Expose()
    status: 'ERROR' | 'SUCCESS';

    @ApiProperty()
    @Expose()
    message: string;
}
