import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { UserAuthority } from '@prisma/client';

export const AUTHORITIES_KEY = 'authorities';
export const Authorities = (
  ...authorities: UserAuthority[]
): CustomDecorator<string> => SetMetadata(AUTHORITIES_KEY, authorities);
