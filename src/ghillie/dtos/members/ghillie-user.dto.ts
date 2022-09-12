import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GhillieUserDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  userId: string;
}
