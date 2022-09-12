import { IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GhilliePostQuery {
  @IsInt()
  @Type(() => Number)
  take = 10;

  @IsString()
  cursor?: string;
}
