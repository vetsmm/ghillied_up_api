import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength
} from "class-validator";

export class CreateSuperUserInputDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  lastName?: string;

  @IsNotEmpty()
  @Length(6, 100)
  @IsAlphanumeric()
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 100)
  password: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  email: string;
}
