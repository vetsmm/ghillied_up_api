import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GhillieOwnershipTransferDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  transferToUserId: string;
}
