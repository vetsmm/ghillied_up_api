import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseFlagInputDto } from '../base-flag-input.dto';

export class FlagCommentInputDto extends BaseFlagInputDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly commentId: string;
}
