import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { ServiceBranch, ServiceStatus } from '@prisma/client';

export class UpdateUserInput {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(100)
  @IsString()
  firstName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(100)
  @IsString()
  lastName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @Length(6, 100)
  @IsString()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  serviceEntryDate: Date;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  serviceExitDate: Date;

  @ApiProperty()
  @IsEnum(ServiceBranch)
  branch: ServiceBranch;

  @ApiProperty()
  @IsEnum(ServiceStatus)
  serviceStatus: ServiceStatus;
}
