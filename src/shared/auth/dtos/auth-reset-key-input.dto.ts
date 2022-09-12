import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, MaxLength } from 'class-validator';

export class AuthResetKeyInputDto {
  @ApiProperty()
  @MaxLength(6)
  @IsNumber()
  resetKey: number;
}
