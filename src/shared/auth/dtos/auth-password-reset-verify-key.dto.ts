import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class AuthPasswordResetVerifyKeyDto {
    @ApiProperty()
    @Min(100000)
    @Max(999999)
    @IsNumber()
    resetKey: number;
}
