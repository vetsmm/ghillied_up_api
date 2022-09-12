import { Test, TestingModule } from '@nestjs/testing';

import { BaseAclService } from './acl.service';
import { RuleCallback } from './acl-rule.constant';
import { Action } from './action.constant';
import { UserAuthority } from '@prisma/client';

import { describe, beforeEach, it, expect } from '@jest/globals';
import { Actor } from './actor.constant';

class MockResource {
  id: number;
}

class MockAclService extends BaseAclService<MockResource> {
  public canDo(
    authority: UserAuthority,
    actions: Action[],
    ruleCallback?: RuleCallback<MockResource>,
  ) {
    super.canDo(authority, actions, ruleCallback);
  }

  public getAclRules() {
    return this.aclRules;
  }
}

describe('AclService', () => {
  let service: MockAclService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockAclService],
    }).compile();

    service = module.get<MockAclService>(MockAclService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('canDo', () => {
    it('should add acl rule', () => {
      service.canDo(UserAuthority.ROLE_USER, [Action.Read]);
      const aclRules = service.getAclRules();
      expect(aclRules).toContainEqual({
        authority: UserAuthority.ROLE_USER,
        actions: [Action.Read],
      });
    });

    it('should add acl rule with custom rule', () => {
      const customRuleCallback = () => true;
      service.canDo(UserAuthority.ROLE_USER, [Action.Read], customRuleCallback);

      const aclRules = service.getAclRules();

      expect(aclRules).toContainEqual({
        authority: UserAuthority.ROLE_USER,
        actions: [Action.Read],
        ruleCallback: customRuleCallback,
      });
    });
  });

  describe('forActor', () => {
    const user: Actor = {
      id: '6',
      authorities: [UserAuthority.ROLE_USER],
    };

    const admin: Actor = {
      id: '7',
      authorities: [UserAuthority.ROLE_USER],
    };

    it('should return canDoAction method', () => {
      const userAcl = service.forActor(user);
      expect(userAcl.canDoAction).toBeDefined();
    });

    it('should return false when no role specific rules found', () => {
      service.canDo(UserAuthority.ROLE_USER, []);
      const userAcl = service.forActor(admin);
      expect(userAcl.canDoAction(Action.Read)).toBeFalsy();
    });

    it('should return false when no action specific rules found', () => {
      service.canDo(UserAuthority.ROLE_USER, []);
      const userAcl = service.forActor(user);
      expect(userAcl.canDoAction(Action.Create)).toBeFalsy();
    });

    it('should return true when role has action permission', () => {
      service.canDo(UserAuthority.ROLE_USER, [Action.Read]);
      const userAcl = service.forActor(user);
      expect(userAcl.canDoAction(Action.Read)).toBeTruthy();
    });

    it('should return true when ruleCallback is true', () => {
      const customOwnerRule = () => true;
      service.canDo(UserAuthority.ROLE_USER, [Action.Manage], customOwnerRule);
      const userAcl = service.forActor(user);
      expect(userAcl.canDoAction(Action.Read)).toBeTruthy();
    });

    it('should return false when ruleCallback is false', () => {
      const customOwnerRule = () => false;
      service.canDo(UserAuthority.ROLE_USER, [Action.Manage], customOwnerRule);
      const userAcl = service.forActor(user);
      expect(userAcl.canDoAction(Action.Read)).toBeFalsy();
    });
  });
});
