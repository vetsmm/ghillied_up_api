import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TopicLiteOutputDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  slug: string;
}
