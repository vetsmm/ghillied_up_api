import { BaseFlagInputDto } from '../base-flag-input.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FlagPostInputDto extends BaseFlagInputDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly postId: string;
}
