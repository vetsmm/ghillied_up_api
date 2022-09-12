import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FlagCategory } from '@prisma/client';

export class BaseFlagInputDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly details?: string;

  @ApiProperty()
  @IsEnum(FlagCategory)
  readonly flagCategory: FlagCategory;
}
