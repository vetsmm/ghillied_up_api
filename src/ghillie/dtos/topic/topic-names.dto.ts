import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class TopicNamesDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  topicNames?: string[];
}
