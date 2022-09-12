import { AclRule, RuleCallback } from './acl-rule.constant';
import { Action } from './action.constant';
import { Actor } from './actor.constant';
import { UserAuthority } from '@prisma/client';

export class BaseAclService<Resource> {
  /**
   * ACL rules
   */
  protected aclRules: AclRule<Resource>[] = [];

  /**
   * Set ACL rule for a role
   */
  protected canDo(
    authorities: UserAuthority[] | UserAuthority,
    actions: Action[],
    ruleCallback?: RuleCallback<Resource>,
  ): void {
    // if authorities is not an array, make it one
    if (!Array.isArray(authorities)) {
      authorities = [authorities];
    }
    ruleCallback
      ? this.aclRules.push({ authorities, actions, ruleCallback })
      : this.aclRules.push({ authorities, actions });
  }

  /**
   * create users specific acl object to check ability to perform any action
   */
  public forActor = (actor: Actor): any => {
    return {
      canDoAction: (action: Action, resource?: Resource) => {
        let canDoAction = false;

        actor.authorities.forEach((actorRole) => {
          //If already has access, return
          if (canDoAction) return true;

          //find all rules for given users role
          // const aclRules = this.aclRules.filter(
          //   (rule) => rule.authorities === actorRole,
          // );
          const aclRules = this.aclRules.filter((rule) =>
            rule.authorities.includes(actorRole),
          );

          //for each rule, check action permission
          aclRules.forEach((aclRule) => {
            //If already has access, return
            if (canDoAction) return true;

            //check action permission
            const hasActionPermission =
              aclRule.actions.includes(action) ||
              aclRule.actions.includes(Action.Manage);

            //check for custom `ruleCallback` callback
            canDoAction =
              hasActionPermission &&
              (!aclRule.ruleCallback || aclRule.ruleCallback(resource, actor));
          });
        });

        return canDoAction;
      },
    };
  };
}
