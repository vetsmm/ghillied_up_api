import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { UserAuthority } from '@prisma/client';

export class RegisterOutput {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  firstName: string;

  @Expose()
  @ApiProperty()
  lastName: string;

  @Expose()
  @ApiProperty()
  username: string;

  @Expose()
  @ApiProperty()
  slug: string;

  @Expose()
  @ApiProperty({ example: [UserAuthority.ROLE_USER] })
  authorities: UserAuthority[];

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  activated: boolean;

  @Expose()
  @ApiProperty()
  createdDate: string;

  @Expose()
  @ApiProperty()
  updatedDate: string;
}
