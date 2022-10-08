import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-local';

import { STRATEGY_LOCAL } from '../constants/strategy.constant';
import { AuthService } from '../services/auth.service';
import {
    AppLogger,
    createRequestContext,
    UserAccessTokenClaims,
} from '../../shared';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, STRATEGY_LOCAL) {
    constructor(
        private authService: AuthService,
        private readonly logger: AppLogger,
    ) {
        // Add option passReqToCallback: true to configure strategy to be request-scoped.
        super({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true,
        });
        this.logger.setContext(LocalStrategy.name);
    }

    async validate(
        request: Request,
        username: string,
        password: string,
    ): Promise<UserAccessTokenClaims> {
        const ctx = createRequestContext(request);

        this.logger.log(ctx, `${this.validate.name} was called`);

        // Passport automatically creates a users object, based on the value we return from the validate() method,
        // and assigns it to the Request object as req.users
        return await this.authService.validateUser(ctx, username, password);
    }
}
