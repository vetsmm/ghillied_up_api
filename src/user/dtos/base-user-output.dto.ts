import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceBranch, ServiceStatus } from '@prisma/client';

export class BaseUserOutputDto {
  @Expose()
  @ApiProperty()
  username: string;

  @Expose()
  @ApiProperty()
  slug: string;

  @Expose()
  @ApiProperty()
  branch: ServiceBranch;

  @Expose()
  @ApiProperty()
  serviceStatus: ServiceStatus;

  @Expose()
  @ApiProperty()
  isVerifiedMilitary: boolean;

  @Expose()
  @ApiProperty()
  serviceEntryDate: string;

  @Expose()
  @ApiProperty()
  serviceExitDate: string;

  @Expose()
  @ApiProperty()
  lastLoginAt: string;

  @Expose()
  @ApiProperty()
  imageUrl: string;
}
