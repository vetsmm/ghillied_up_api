import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsOptional,
    IsString,
    Length,
    MaxLength,
} from 'class-validator';

export class LoginInput {
    @IsNotEmpty()
    @ApiProperty()
    @IsString()
    @MaxLength(200)
    username: string;

    @IsNotEmpty()
    @ApiProperty()
    @IsString()
    password: string;

    @IsString()
    @Length(6)
    @IsOptional()
    code?: string;
}
