import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, MaxLength } from 'class-validator';

export class AuthResendVerifyEmailInputDto {
  @ApiProperty()
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @ApiProperty()
  @IsOptional()
  @MaxLength(100)
  username?: string;
}
