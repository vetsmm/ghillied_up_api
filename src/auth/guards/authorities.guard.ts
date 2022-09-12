import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AUTHORITIES_KEY } from '../decorators/authority.decorator';
import { UserAuthority } from '@prisma/client';

@Injectable()
export class AuthoritiesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    console.log('context', context);
    const requiredAuthorities = this.reflector.getAllAndOverride<
      UserAuthority[]
    >(AUTHORITIES_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredAuthorities) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    if (
      requiredAuthorities.some((authority) =>
        user.authorities?.includes(authority),
      )
    ) {
      return true;
    }

    throw new UnauthorizedException(
      `User does not have the required authorities to access this resource.`,
    );
  }
}
