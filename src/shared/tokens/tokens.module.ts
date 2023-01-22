import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokensService } from './tokens.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                publicKey: configService.get<string>('jwt.publicKey'),
                privateKey: configService.get<string>('jwt.privateKey'),
                signOptions: {
                    algorithm: 'RS256',
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [TokensService],
    exports: [TokensService],
})
export class TokensModule {}
