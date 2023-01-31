import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configModuleOptions } from './configs/module-options';
import { AppLoggerModule } from './logger/logger.module';
import { MailConfigService, MailModule } from './mail';
import { MailerModule } from '@vetsmm/mailer';
import { SnsModule } from '@vetsmm/nestjs-sns';
import { NestPgpromiseModule } from 'nestjs-pgpromise';
import { PgPromiseConfigService } from './database/pgpromise-config.service';
import { GetStreamModule } from './getsream/getstream.module';
import {
    AWSSecretsManagerModule,
    AWSSecretsManagerModuleOptions,
    AWSSecretsService,
} from './secrets-manager';
import { SecretsManager } from 'aws-sdk';
import { GeolocationModule } from './geolocation/geolocation.module';
import { TokensModule } from './tokens/tokens.module';
import { TwilioModule } from './twilio/twilio.module';

const getSecretSources = (configService: ConfigService) => {
    if (configService.get('appEnv') === 'DEV') {
        return [];
    }
    const secretSources = configService.get<object>('secretsSources');
    return Object.keys(secretSources).map((key) => secretSources[key]);
};

const getStreamSecrets = async (
    secretsService: AWSSecretsService,
    configService: ConfigService,
) => {
    if (configService.get('appEnv') === 'DEV') {
        return {
            STREAM_API_KEY: configService.get('stream.apiKey'),
            STREAM_API_SECRET: configService.get('stream.apiSecret'),
            STREAM_APP_ID: configService.get('stream.appId'),
        };
    }
    return await secretsService.getSecrets<{
        STREAM_API_KEY: string;
        STREAM_API_SECRET: string;
        STREAM_APP_ID: string;
    }>(configService.get('secretsSources.stream'));
};

@Module({
    imports: [
        CacheModule.register(),
        AWSSecretsManagerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                return {
                    secretsManager: new SecretsManager({
                        region: 'us-east-1',
                    }),
                    isSetToEnv: true,
                    secretsSource: getSecretSources(configService),
                    isDebug: process.env.NODE_ENV === 'development',
                } as unknown as AWSSecretsManagerModuleOptions;
            },
        }),
        ConfigModule.forRoot(configModuleOptions),
        AppLoggerModule,
        MailModule,
        MailerModule.forRootAsync({
            useClass: MailConfigService,
        }),
        NestPgpromiseModule.registerAsync({
            useClass: PgPromiseConfigService,
        }),
        SnsModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                region: configService.get<string>('aws.region'),
            }),
            inject: [ConfigService],
            isGlobal: true,
        }),
        GetStreamModule.registerAsync({
            imports: [ConfigModule, AWSSecretsManagerModule],
            useFactory: async (
                configService: ConfigService,
                secretsService: AWSSecretsService,
            ) => {
                const secrets = await getStreamSecrets(
                    secretsService,
                    configService,
                );
                return {
                    apiKey: secrets.STREAM_API_KEY,
                    apiSecret: secrets.STREAM_API_SECRET,
                    appId: secrets.STREAM_APP_ID,
                    clientOptions: {
                        timeout: 10000,
                    },
                };
            },
            inject: [ConfigService, AWSSecretsService],
            isGlobal: true,
        }),
        GeolocationModule,
        TokensModule,
        TwilioModule,
    ],
    controllers: [],
    providers: [],
    exports: [
        AppLoggerModule,
        ConfigModule,
        MailModule,
        AWSSecretsManagerModule,
        GeolocationModule,
        TokensModule,
        TwilioModule,
    ],
})
export class SharedModule {}
