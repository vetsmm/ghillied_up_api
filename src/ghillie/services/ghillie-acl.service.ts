import { Injectable } from '@nestjs/common';

import { UserAuthority, GhillieMembers, GhillieRole } from '@prisma/client';
import { Action, Actor, BaseAclService } from '../../shared';

@Injectable()
export class GhillieAclService extends BaseAclService<GhillieMembers> {
    constructor() {
        super();
        // Admin can do all action
        this.canDo(UserAuthority.ROLE_ADMIN, [Action.Manage]);
        //users can read himself or any other users
        this.canDo(
            [UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY],
            [Action.Read],
        );

        this.canDo(
            [UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY],
            [Action.Create],
        );

        //users can read himself or any other users
        this.canDo(
            [UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY],
            [Action.List],
        );
        // users can only update ghillie if they are the owner
        this.canDo(
            [UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY],
            [Action.Update],
            this.isUserOwner,
        );

        // users can only delete ghillie if they are the owner
        this.canDo(UserAuthority.ROLE_USER, [Action.Delete], this.isUserOwner);

        this.canDo(
            [UserAuthority.ROLE_VERIFIED_MILITARY],
            [Action.JoinGhillie],
        );

        this.canDo(
            [UserAuthority.ROLE_USER],
            [Action.GhillieManage],
            this.isUserOwner,
        );

        this.canDo(
            [UserAuthority.ROLE_USER],
            [Action.GhillieModerator],
            this.isUserOwnerOrModerator,
        );
    }

    isUserOwner(resource: GhillieMembers, actor: Actor): boolean {
        return (
            resource.role === GhillieRole.OWNER && resource.userId === actor.id
        );
    }

    isUserOwnerOrModerator(resource: GhillieMembers, actor: Actor): boolean {
        return (
            (resource.role === GhillieRole.OWNER &&
                resource.userId === actor.id) ||
            (resource.role === GhillieRole.MODERATOR &&
                resource.userId === actor.id)
        );
    }
}
