import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthPasswordResetFinishDto {
    @IsNotEmpty()
    @ApiProperty()
    @IsNumber()
    resetKey: number;

    @IsNotEmpty()
    @ApiProperty()
    @IsString()
    newPassword: string;
}
