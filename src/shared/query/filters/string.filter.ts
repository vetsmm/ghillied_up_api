import { Enumerable } from './types';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class NestedStringNullableFilter {
  @ApiProperty()
  @IsOptional()
  @IsString()
  equals?: string | null;

  @ApiProperty({
    oneOf: [
      { type: 'string' },
      {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    ],
  })
  @IsOptional()
  in?: Enumerable<string> | null;

  @ApiProperty({
    oneOf: [
      { type: 'string' },
      {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    ],
  })
  @IsOptional()
  notIn?: Enumerable<string> | null;

  @ApiProperty()
  @IsOptional()
  @IsString()
  lt?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  lte?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  gt?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  gte?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  contains?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  startsWith?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  endsWith?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    type: () => NestedStringNullableFilter,
  })
  @IsOptional()
  not?: NestedStringNullableFilter | string | null;
}

export class NestedStringFilter {
  @ApiProperty()
  @IsOptional()
  @IsString()
  equals?: string;

  @ApiProperty({
    oneOf: [
      { type: 'string' },
      {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    ],
  })
  @IsOptional()
  in?: Enumerable<string>;

  @ApiProperty({
    oneOf: [
      { type: 'string' },
      {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    ],
  })
  @IsOptional()
  notIn?: Enumerable<string>;

  @ApiProperty()
  @IsOptional()
  @IsString()
  lt?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  lte?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  gt?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  gte?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  contains?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  startsWith?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  endsWith?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    type: () => NestedStringNullableFilter,
  })
  @IsOptional()
  not?: NestedStringFilter | string;
}

export class StringFilter {
  @ApiProperty()
  @IsOptional()
  @IsString()
  equals?: string;

  @ApiProperty({
    oneOf: [
      { type: 'string' },
      {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    ],
  })
  @IsOptional()
  @IsString()
  in?: Enumerable<string>;

  @ApiProperty({
    oneOf: [
      { type: 'string' },
      {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    ],
  })
  @IsOptional()
  notIn?: Enumerable<string>;

  @ApiProperty()
  @IsOptional()
  @IsString()
  lt?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  lte?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  gt?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  gte?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  contains?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  startsWith?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  endsWith?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    type: () => NestedStringNullableFilter,
  })
  @IsOptional()
  not?: NestedStringFilter | string;
}
