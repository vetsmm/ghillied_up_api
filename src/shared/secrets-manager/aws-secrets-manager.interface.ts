import { Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { SecretsManager } from 'aws-sdk';

export interface AWSSecretsManagerModuleOptions {
    secretsManager: SecretsManager;
    isSetToEnv?: boolean;
    secretsSource?: string[];
    isDebug?: boolean;
}

export interface AWSSecretsManagerModuleOptionsFactory {
    createAWSSecrectsManagerModuleOptions():
        | Promise<AWSSecretsManagerModuleOptions>
        | AWSSecretsManagerModuleOptions;
}

export interface AWSSecretsManagerModuleAsyncOptions
    extends Pick<ModuleMetadata, 'imports'> {
    useFactory?: (
        ...args: any[]
    ) =>
        | Promise<AWSSecretsManagerModuleOptions>
        | AWSSecretsManagerModuleOptions;
    inject?: any[];
    useClass?: Type<AWSSecretsManagerModuleOptionsFactory>;
}
