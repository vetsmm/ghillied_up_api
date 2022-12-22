import {
    Injectable,
    CanActivate,
    ExecutionContext,
    Inject,
    UnauthorizedException,
} from '@nestjs/common';
import { NEST_PGPROMISE_CONNECTION } from 'nestjs-pgpromise';
import { IDatabase } from 'pg-promise';
import { UserStatus } from '@prisma/client';

@Injectable()
export class ActiveUserGuard implements CanActivate {
    constructor(
        @Inject(NEST_PGPROMISE_CONNECTION) private readonly pg: IDatabase<any>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const { user } = context.switchToHttp().getRequest();

        const maybeUser = await this.pg.oneOrNone(
            'SELECT * FROM "user" WHERE id = $1',
            [user.id],
        );

        if (!maybeUser) {
            return false;
        }

        // Check if user's status is active
        const isActive = maybeUser.status === UserStatus.ACTIVE;

        if (!isActive) {
            switch (maybeUser.status) {
                case UserStatus.BANNED:
                    throw new UnauthorizedException('User account is banned');
                case UserStatus.DELETED:
                    throw new UnauthorizedException(
                        'User account is deactivated',
                    );
                case UserStatus.SUSPENDED:
                    throw new UnauthorizedException(
                        'User account is suspended',
                    );
                default:
                    throw new UnauthorizedException(
                        'User account is not active',
                    );
            }
        }

        return true;
    }
}
