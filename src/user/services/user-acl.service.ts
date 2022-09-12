import { Injectable } from '@nestjs/common';

import { User, UserAuthority } from '@prisma/client';
import { Action, Actor, BaseAclService } from '../../shared';

@Injectable()
export class UserAclService extends BaseAclService<User> {
  constructor() {
    super();
    // Admin can do all action
    this.canDo(UserAuthority.ROLE_ADMIN, [Action.Manage]);
    //users can read himself or any other users
    this.canDo(UserAuthority.ROLE_USER, [Action.Read]);
    //users can read himself or any other users
    this.canDo(UserAuthority.ROLE_USER, [Action.List]);
    // users can only update himself
    this.canDo(UserAuthority.ROLE_USER, [Action.Update], this.isUserItself);
  }

  isUserItself(resource: User, actor: Actor): boolean {
    return resource.id === actor.id;
  }
}
