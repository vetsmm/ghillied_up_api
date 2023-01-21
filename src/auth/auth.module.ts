import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UserModule } from '../user/user.module';
import { STRATEGY_JWT_AUTH } from './constants/strategy.constant';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtAuthStrategy } from './strategies/jwt-auth.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { SharedModule } from '../shared';
import { HttpModule } from '@nestjs/axios';
import { AuthIdMeController } from './controllers/id-me.controller';
import { AuthIdMeService } from './services/id-me.service';
import {
    AWSSecretsManagerModule,
    AWSSecretsService,
} from '../shared/secrets-manager';

const getJWTSecrets = async (
    secretsService: AWSSecretsService,
    configService: ConfigService,
) => {
    if (configService.get('appEnv') === 'DEV') {
        return {
            JWT_PUBLIC_KEY_BASE64: configService.get('jwt.publicKey'),
            JWT_PRIVATE_KEY_BASE64: configService.get('jwt.privateKey'),
        };
    }
    return await secretsService.getSecrets<{
        JWT_PUBLIC_KEY_BASE64: string;
        JWT_PRIVATE_KEY_BASE64: string;
    }>(configService.get('secretsSources.jwt'));
};
@Module({
    imports: [
        SharedModule,
        PassportModule.register({ defaultStrategy: STRATEGY_JWT_AUTH }),
        JwtModule.registerAsync({
            imports: [SharedModule],
            useFactory: async (
                configService: ConfigService,
                secretsService: AWSSecretsService,
            ) => {
                const secrets = await getJWTSecrets(
                    secretsService,
                    configService,
                );
                return {
                    publicKey: secrets.JWT_PUBLIC_KEY_BASE64,
                    privateKey: secrets.JWT_PRIVATE_KEY_BASE64,
                    signOptions: {
                        algorithm: 'RS256',
                    },
                };
            },
            inject: [ConfigService, AWSSecretsService],
        }),
        UserModule,
        AuthModule,
        HttpModule,
    ],
    controllers: [AuthController, AuthIdMeController],
    providers: [
        AuthService,
        LocalStrategy,
        JwtAuthStrategy,
        JwtRefreshStrategy,
        AuthIdMeService,
    ],
})
export class AuthModule {}
