import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCommentReplyDto {
    @ApiProperty()
    @IsString()
    readonly content: string;
}
