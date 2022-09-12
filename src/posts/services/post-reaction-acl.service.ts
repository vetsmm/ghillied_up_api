import { Injectable } from '@nestjs/common';

import { UserAuthority, Post } from '@prisma/client';
import { Action, BaseAclService } from '../../shared';

@Injectable()
export class PostReactionAclService extends BaseAclService<Post> {
  constructor() {
    super();

    this.canDo(UserAuthority.ROLE_ADMIN, [Action.Manage]);

    // A user can post to a ghillie
    this.canDo(
      [UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY],
      [Action.Create],
    );

    // users can only update post if they are the owner
    this.canDo(
      [UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY],
      [Action.Update],
    );

    // Only an admin can do a hard delete
    this.canDo(
      [UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY],
      [Action.Delete],
    );

    //users can read himself or any other users
    this.canDo([UserAuthority.ROLE_USER], [Action.Read]);

    //users can read himself or any other users
    this.canDo([UserAuthority.ROLE_USER], [Action.List]);
  }
}
