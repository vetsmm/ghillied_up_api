import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthPasswordResetInitDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;
}
