import { Injectable } from '@nestjs/common';

import { UserAuthority, Post } from '@prisma/client';
import { Action, Actor, BaseAclService } from '../../shared';

@Injectable()
export class PostFeedAclService extends BaseAclService<Post> {
  constructor() {
    super();
    // Admin can do all action
    this.canDo(UserAuthority.ROLE_ADMIN, [Action.Manage]);

    // A user can post to a ghillie
    this.canDo(
      [UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY],
      [Action.Create],
    );

    //users can read himself or any other users
    this.canDo(
      [UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY],
      [Action.Read],
    );

    //users can read himself or any other users
    this.canDo(
      [UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY],
      [Action.List],
    );

    // users can only update post if they are the owner
    this.canDo(
      [UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY],
      [Action.Update],
      this.isUserPostOwner,
    );

    // Only an admin can do a hard delete
    this.canDo(UserAuthority.ROLE_ADMIN, [Action.Delete]);
  }

  isUserPostOwner(post: Post, user: Actor): boolean {
    return post.postedById === user.id;
  }
}
