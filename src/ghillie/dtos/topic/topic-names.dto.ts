import { ApiProperty } from '@nestjs/swagger';

export class TopicNamesDto {
    @ApiProperty()
    // @IsString({ each: true })
    topicNames: string[];
}
