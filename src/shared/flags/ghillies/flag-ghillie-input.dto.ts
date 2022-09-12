import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseFlagInputDto } from '../base-flag-input.dto';

export class FlagGhillieInputDto extends BaseFlagInputDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly ghillieId: string;
}
