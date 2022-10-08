import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthIdMeVerifyDto {
    @ApiProperty({ example: 'abc' })
    @IsNotEmpty()
    @IsString()
    accessToken: string;
}
