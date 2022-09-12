import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGhillieDto {
  @ApiProperty({
    description: 'Ghillie name',
    example: 'Hello world',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Ghillie about',
    example: 'Hello world',
  })
  @IsString()
  @IsOptional()
  about?: string | null;

  @ApiProperty({
    description: 'Ghillie readOnly',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readOnly: boolean;

  @ApiProperty({
    description: 'Ghillie imageUrl',
    example: 'https://example.com/image.png',
  })
  @IsString()
  @IsOptional()
  imageUrl: string | null;

  @ApiProperty({
    description: 'Ghillie topicNames',
    example: ['topic1', 'topic2'],
  })
  @IsArray()
  @IsOptional()
  topicNames: string[];
}
