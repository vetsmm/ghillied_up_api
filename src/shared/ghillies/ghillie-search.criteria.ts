import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { GhillieStatus } from '@prisma/client';
import { PaginationParamsDto } from '../dtos';

export class GhillieSearchCriteria extends PaginationParamsDto {
  @ApiProperty()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsOptional()
  slug?: string;

  @ApiProperty()
  @IsOptional()
  about?: string;

  @ApiProperty()
  @IsOptional()
  status?: GhillieStatus = GhillieStatus.ACTIVE;

  @ApiProperty()
  @IsOptional()
  readonly?: boolean;

  @ApiProperty()
  @IsOptional()
  topicIds?: Array<string>;
}
