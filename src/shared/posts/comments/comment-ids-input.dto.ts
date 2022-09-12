import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max } from 'class-validator';

export class CommentIdsInputDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString({ each: true })
  readonly commentIds: string[];

  @ApiProperty()
  @IsNumber()
  @Max(1)
  readonly height: number;
}
