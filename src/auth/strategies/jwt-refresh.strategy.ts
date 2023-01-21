import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { STRATEGY_JWT_REFRESH } from '../constants/strategy.constant';
import { UserRefreshTokenClaims } from '../../shared';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
    Strategy,
    STRATEGY_JWT_REFRESH,
) {
    constructor(
        private readonly configService: ConfigService,
        private authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
            secretOrKey: configService.get<string>('jwt.publicKey'),
            algorithms: ['RS256'],
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async validate(payload: any): Promise<UserRefreshTokenClaims> {
        await this.authService.validateUser(null, payload.username);
        // Passport automatically creates a users object, based on the value we return from the validate() method,
        // and assigns it to the Request object as req.users
        return { id: payload.sub };
    }
}
