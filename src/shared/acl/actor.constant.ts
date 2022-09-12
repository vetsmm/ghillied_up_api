/**
 * The actor who is perfoming the action
 */
import { UserAuthority } from '@prisma/client';

export interface Actor {
  id: string;
  authorities: UserAuthority[];
}
