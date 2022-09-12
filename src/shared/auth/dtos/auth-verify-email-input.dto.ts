import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class AuthVerifyEmailInputDto {
  @ApiProperty()
  @Min(100000)
  @Max(999999)
  @IsNumber()
  activationCode: number;

  @ApiProperty()
  @IsOptional()
  @MaxLength(100)
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @MaxLength(100)
  username?: string;
}
