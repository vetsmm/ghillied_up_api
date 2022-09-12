import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Enumerable } from './types';

export class NestedDateTimeFilter {
  @ApiProperty()
  @IsOptional()
  @ApiProperty({
    oneOf: [{ type: 'string', format: 'date-time' }],
  })
  equals?: Date | string;

  @IsOptional()
  @ApiProperty({
    oneOf: [
      { type: 'string', format: 'date-time' },
      {
        type: 'array',
        items: {
          type: 'string',
          format: 'date-time',
        },
      },
    ],
  })
  in?: Enumerable<Date> | Enumerable<string>;

  @ApiProperty({
    oneOf: [
      { type: 'string' },
      {
        type: 'array',
        items: {
          type: 'string',
          format: 'date-time',
        },
      },
    ],
  })
  @IsOptional()
  notIn?: Enumerable<Date> | Enumerable<string>;

  @ApiProperty({
    oneOf: [{ type: 'string', format: 'date-time' }],
  })
  @IsOptional()
  lt?: Date | string;

  @ApiProperty({
    oneOf: [{ type: 'string', format: 'date-time' }],
  })
  @IsOptional()
  lte?: Date | string;

  @ApiProperty({
    oneOf: [{ type: 'string', format: 'date-time' }],
  })
  @IsOptional()
  gt?: Date | string;

  @ApiProperty({
    oneOf: [{ type: 'string', format: 'date-time' }],
  })
  @IsOptional()
  gte?: Date | string;

  @ApiProperty()
  @IsOptional()
  not?: NestedDateTimeFilter | Date | string;
}

export class DateTimeFilter {
  @ApiProperty({
    oneOf: [{ type: 'string', format: 'date-time' }],
  })
  @IsOptional()
  equals?: Date | string;

  @ApiProperty({
    oneOf: [
      { type: 'string' },
      {
        type: 'array',
        items: {
          type: 'string',
          format: 'date-time',
        },
      },
    ],
  })
  @IsOptional()
  in?: Enumerable<Date> | Enumerable<string>;

  @ApiProperty({
    oneOf: [
      { type: 'string' },
      {
        type: 'array',
        items: {
          type: 'string',
          format: 'date-time',
        },
      },
    ],
  })
  @IsOptional()
  notIn?: Enumerable<Date> | Enumerable<string>;

  @ApiProperty({
    oneOf: [{ type: 'string', format: 'date-time' }],
  })
  @IsOptional()
  lt?: Date | string;

  @ApiProperty({
    oneOf: [{ type: 'string', format: 'date-time' }],
  })
  @IsOptional()
  lte?: Date | string;

  @ApiProperty({
    oneOf: [{ type: 'string', format: 'date-time' }],
  })
  @IsOptional()
  gt?: Date | string;

  @ApiProperty({
    oneOf: [{ type: 'string', format: 'date-time' }],
  })
  @IsOptional()
  gte?: Date | string;

  @ApiProperty({
    oneOf: [
      { type: 'string', format: 'date-time' },
      { type: 'object', $ref: 'NestedDateTimeFilter' },
    ],
  })
  @IsOptional()
  not?: NestedDateTimeFilter | Date | string;
}
