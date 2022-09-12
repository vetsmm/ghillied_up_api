import { ReactionType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CommentReactionInputDto {
  @ApiProperty({
    description: 'The reaction type',
    example: ReactionType.THUMBS_UP,
  })
  @IsEnum(ReactionType)
  @IsOptional()
  reactionType: ReactionType | null;

  @ApiProperty()
  @IsString()
  commentId: string;
}
