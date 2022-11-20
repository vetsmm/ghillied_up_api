import { Injectable } from '@nestjs/common';

import { UserAuthority, PostComment } from '@prisma/client';
import { Action, Actor, BaseAclService } from '../../shared';

@Injectable()
export class CommentAclService extends BaseAclService<PostComment> {
    constructor() {
        super();
        this.canDo(UserAuthority.ROLE_ADMIN, [Action.Manage]);

        // A user can post a comment to a ghillie
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

        // users can only update comment if they are the owner
        this.canDo(
            [UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY],
            [Action.Update],
            this.isUserCommentOwner,
        );

        // Only an admin can do a hard delete
        this.canDo(UserAuthority.ROLE_ADMIN, [Action.Delete]);
    }

    isUserCommentOwner(comment: PostComment, user: Actor): boolean {
        return comment.createdById === user.id;
    }
}
