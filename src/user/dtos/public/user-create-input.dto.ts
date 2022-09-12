import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceBranch, ServiceStatus } from '@prisma/client';
import {
  IsAlphanumeric,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserInput {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  lastName?: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(6, 100)
  @IsAlphanumeric()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(6, 100)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiProperty({ type: Date, example: '2020-01-01' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  serviceEntryDate?: Date;

  @ApiProperty({ type: Date, example: '2020-01-01' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  serviceExitDate?: Date;

  @ApiProperty()
  @IsEnum(ServiceBranch)
  branch: ServiceBranch;

  @ApiProperty()
  @IsEnum(ServiceStatus)
  serviceStatus: ServiceStatus;
}
