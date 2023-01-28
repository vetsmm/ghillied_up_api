import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDate,
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    Length,
    MaxLength,
} from 'class-validator';
import { ServiceBranch, ServiceStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateUserInput {
    @ApiPropertyOptional()
    @IsOptional()
    @MaxLength(100)
    @IsString()
    firstName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @MaxLength(100)
    @IsString()
    lastName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Length(6, 100)
    @IsString()
    password?: string;

    @ApiProperty()
    @IsEmail()
    @IsOptional()
    @MaxLength(100)
    email?: string;

    @ApiProperty()
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    serviceEntryDate?: Date;

    @ApiProperty()
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    serviceExitDate?: Date;

    @ApiProperty()
    @IsOptional()
    @IsEnum(ServiceBranch)
    branch?: ServiceBranch;

    @ApiProperty()
    @IsEnum(ServiceStatus)
    @IsOptional()
    serviceStatus?: ServiceStatus;
}
