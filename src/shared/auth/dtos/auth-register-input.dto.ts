import { ApiProperty } from '@nestjs/swagger';
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

import { ServiceBranch, ServiceStatus, UserAuthority } from '@prisma/client';

export class RegisterInput {
  @ApiProperty()
  @IsOptional()
  @MaxLength(100, {
    message: 'First name must be at most 100 characters long',
  })
  @IsString()
  firstName?: string;

  @ApiProperty()
  @IsOptional()
  @MaxLength(100, {
    message: 'Last name must be at most 100 characters long',
  })
  @IsOptional()
  lastName?: string;

  @ApiProperty()
  @MaxLength(100, {
    message: 'Username must be at most 100 characters long',
  })
  @IsString({
    message: 'Username must be a string',
  })
  @IsNotEmpty({
    message: 'Username is required',
  })
  username: string;

  @ApiProperty()
  @IsNotEmpty({
    message: 'Password is required',
  })
  @Length(6, 100, {
    message: 'Password must be between 6 and 100 characters long',
  })
  @IsString()
  password: string;

  @ApiProperty()
  @IsNotEmpty({
    message: 'Email is required',
  })
  @IsEmail({
    message: 'Email must be a valid email address',
  })
  @MaxLength(100, {
    message: 'Email must be at most 100 characters long',
  })
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsDate({
    message: 'Service Entry must be a valid date',
  })
  serviceEntryDate: Date;

  @ApiProperty()
  @IsOptional()
  @IsDate({
    message: 'Service Exit must be a valid date',
  })
  serviceExitDate: Date;

  @ApiProperty()
  @IsEnum(ServiceBranch, {
    message:
      'Service Branch must be one of the following: ' +
      Object.values(ServiceBranch)
        .map((branch) => branch.toString())
        .join(', '),
  })
  branch: ServiceBranch;

  @ApiProperty()
  @IsEnum(ServiceStatus, {
    message:
      'Service Status must be one of the following: ' +
      Object.values(ServiceStatus)
        .map((status) => status.toString())
        .join(', '),
  })
  serviceStatus: ServiceStatus;

  // These keys can only be set by ADMIN users.
  authorities: UserAuthority[] = [UserAuthority.ROLE_USER];
  activated: boolean;
}
