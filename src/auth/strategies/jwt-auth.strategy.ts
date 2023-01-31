import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { STRATEGY_JWT_AUTH } from '../constants/strategy.constant';
import { UserAccessTokenClaims } from '../../shared';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(
    Strategy,
    STRATEGY_JWT_AUTH,
) {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<string>('jwt.privateKey'),
            algorithms: ['RS256'],
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async validate(payload: any): Promise<UserAccessTokenClaims> {
        // Passport automatically creates a users object, based on the value we return from the validate() method,
        // and assigns it to the Request object as req.users
        return {
            id: payload.userId,
            sessionId: payload.sessionId,
            username: payload.username,
            authorities: payload.authorities,
        };
    }
}
