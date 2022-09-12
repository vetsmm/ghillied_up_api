import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGhillieInputDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  name: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  about?: string | null;

  @IsNotEmpty()
  @ApiProperty()
  @IsBoolean()
  readOnly: boolean;

  @IsOptional()
  @ApiProperty()
  @IsString()
  // TODO: Move to S3 reference
  //  keep this until we move to S3, where we will remove this in the request, and replace with the S3 location
  imageUrl?: string | null;

  @IsNotEmpty()
  @ApiProperty({
    type: [String],
  })
  @IsArray()
  @IsOptional()
  topicNames?: string[] | null;
}
