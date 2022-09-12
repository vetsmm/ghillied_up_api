import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, Max, MaxLength, Min } from 'class-validator';

export class AuthPasswordResetVerifyKeyDto {
  @ApiProperty()
  @Min(100000)
  @Max(999999)
  @IsNumber()
  resetKey: number;

  @ApiProperty()
  @MaxLength(100)
  @IsEmail()
  email: string;
}
