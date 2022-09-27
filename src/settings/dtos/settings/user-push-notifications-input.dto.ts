import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UserPushNotificationsInputDto {
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  postReactions?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  postComments?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  commentReactions?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  postActivity?: boolean;
}
