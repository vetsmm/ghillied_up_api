import { Enumerable } from './types';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class NestedFilter<T> {
  @ApiProperty()
  @IsOptional()
  equals?: T;

  @ApiProperty()
  @IsOptional()
  in?: Enumerable<T>;

  @ApiProperty()
  @IsOptional()
  notIn?: Enumerable<T>;

  @ApiProperty()
  @IsOptional()
  not?: NestedFilter<T> | T;
}

export class Filter<T> {
  @ApiProperty()
  @IsOptional()
  equals?: T;

  @ApiProperty()
  @IsOptional()
  in?: Enumerable<T>;

  @ApiProperty()
  @IsOptional()
  notIn?: Enumerable<T>;

  @ApiProperty()
  @IsOptional()
  not?: NestedFilter<T> | T;
}
