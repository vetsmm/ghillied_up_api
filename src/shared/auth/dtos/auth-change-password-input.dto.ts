import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthChangePasswordInputDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  oldPassword: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  newPassword: string;
}
