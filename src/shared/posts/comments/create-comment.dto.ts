import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCommentDto {
    @ApiProperty()
    @IsString()
    readonly content: string;

    @ApiProperty()
    @IsString()
    readonly postId: string;
}
