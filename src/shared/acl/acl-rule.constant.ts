import { Action } from './action.constant';
import { Actor } from './actor.constant';
import { UserAuthority } from '@prisma/client';

/**
 * Custom rule callback definition
 */
export type RuleCallback<Resource> = (
  resource: Resource,
  actor: Actor,
) => boolean;

/**
 * ACL rule format
 */
export type AclRule<Resource> = {
  //if rule for particular role or for all role
  authorities: UserAuthority[];

  //list of actions permissible
  actions: Action[];

  //specific rule there or otherwise true
  ruleCallback?: RuleCallback<Resource>;
};
