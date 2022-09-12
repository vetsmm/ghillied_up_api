import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PostStatus } from '@prisma/client';
import { DateTimeFilter } from '../query/filters/date-time-filter';
import { Enumerable, StringFilter } from '../query';

export class NestedEnumPostStatusFilter {
  @ApiProperty()
  @IsEnum(PostStatus)
  @IsOptional()
  equals?: PostStatus;

  @ApiProperty({
    oneOf: [
      { type: 'enum', $ref: 'PostStatus' },
      {
        type: 'array',
        items: {
          type: 'enum',
          $ref: 'PostStatus',
        },
      },
    ],
  })
  @IsEnum(PostStatus)
  @IsOptional()
  in?: Enumerable<PostStatus>;

  @ApiProperty({
    oneOf: [
      { type: 'enum', $ref: 'PostStatus' },
      {
        type: 'array',
        items: {
          type: 'enum',
          $ref: 'PostStatus',
        },
      },
    ],
  })
  @IsOptional()
  notIn?: Enumerable<PostStatus>;

  @ApiProperty({
    oneOf: [
      { type: 'enum', $ref: 'PostStatus' },
      {
        type: 'object',
        $ref: 'NestedEnumPostStatusFilter',
      },
    ],
  })
  @IsOptional()
  not?: NestedEnumPostStatusFilter | PostStatus;
}

export class PostStatusFilter {
  @ApiProperty()
  @IsEnum(PostStatus)
  @IsOptional()
  equals?: PostStatus;

  @ApiProperty({
    oneOf: [
      { type: 'enum', $ref: 'PostStatus' },
      {
        type: 'array',
        items: {
          type: 'enum',
          $ref: 'PostStatus',
        },
      },
    ],
  })
  @IsOptional()
  in?: Enumerable<PostStatus>;

  @ApiProperty({
    oneOf: [
      { type: 'enum', $ref: 'PostStatus' },
      {
        type: 'array',
        items: {
          type: 'enum',
          $ref: 'PostStatus',
        },
      },
    ],
  })
  @IsOptional()
  notIn?: Enumerable<PostStatus>;

  @ApiProperty({
    oneOf: [
      { type: 'enum', $ref: 'PostStatus' },
      {
        type: 'object',
        $ref: 'NestedEnumPostStatusFilter',
      },
    ],
  })
  @IsOptional()
  not?: NestedEnumPostStatusFilter | PostStatus;
}

export class FeedFilters {
  @ApiProperty({
    type: () => StringFilter,
  })
  @IsOptional()
  id?: StringFilter | string;

  @ApiProperty({
    type: () => StringFilter,
  })
  @IsOptional()
  uid?: StringFilter | string;

  @ApiProperty({
    type: () => StringFilter,
  })
  @IsOptional()
  title?: StringFilter | string;

  @ApiProperty({
    type: () => StringFilter,
  })
  @IsOptional()
  content?: StringFilter | string;

  @ApiProperty({
    type: () => StringFilter,
  })
  @IsOptional()
  ghillieId?: StringFilter | string;

  @ApiProperty({
    type: () => StringFilter,
  })
  @IsOptional()
  postedById?: StringFilter | string;

  @ApiProperty({
    oneOf: [
      { type: 'enum', $ref: 'PostStatus', enum: Object.values(PostStatus) },
      {
        type: 'object',
        $ref: 'PostStatusFilter',
      },
    ],
  })
  @IsOptional()
  status?: PostStatusFilter | PostStatus;

  @ApiProperty({
    oneOf: [
      { type: 'string', format: 'date-time' },
      {
        type: 'object',
        $ref: 'DateTimeFilter',
      },
    ],
  })
  @IsOptional()
  createdDate?: DateTimeFilter | Date | string;

  @ApiProperty({
    oneOf: [
      { type: 'string', format: 'date-time' },
      {
        type: 'object',
        $ref: 'DateTimeFilter',
      },
    ],
  })
  @IsOptional()
  updatedDate?: DateTimeFilter | Date | string;
}
