import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CheckVerificationCodeDto {
    @ApiProperty()
    @IsString()
    @MaxLength(6)
    code: string;
}
