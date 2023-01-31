import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class TotpLoginDto {
    @IsString()
    @IsNotEmpty()
    token!: string;

    @IsString()
    @IsOptional()
    origin?: string;

    @IsString()
    @Length(6)
    @IsNotEmpty()
    code!: string;
}
