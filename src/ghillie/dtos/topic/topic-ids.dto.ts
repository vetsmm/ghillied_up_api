import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class TopicIdsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  topicIds?: string[];
}
