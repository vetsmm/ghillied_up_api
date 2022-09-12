import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthPasswordResetFinishDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsNumber()
  resetKey: number;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  newPassword: string;
}
