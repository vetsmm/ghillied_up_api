import { Inject, Injectable, Logger } from '@nestjs/common';
import { AWS_SECRETS_MANAGER_MODULE_OPTIONS } from './constants';
import { AWSSecretsManagerModuleOptions } from './aws-secrets-manager.interface';

@Injectable()
export class AWSSecretsService {
    private readonly logger = new Logger(AWSSecretsService.name);

    constructor(
        @Inject(AWS_SECRETS_MANAGER_MODULE_OPTIONS)
        private readonly options: AWSSecretsManagerModuleOptions,
    ) {
        this.setAllSecrectToEnv();
    }

    async setAllSecrectToEnv() {
        const secrets = await this.getAllSecrets();

        if (this.options.isSetToEnv) {
            Object.keys(secrets).forEach((key) => {
                process.env[key] = secrets[key];
            });
        }
        if (this.options.isDebug) {
            this.logger.log(JSON.stringify(secrets, null, 2));
        }
    }

    async getAllSecrets<T>() {
        const resp = this.options.secretsSource.map((secretId) =>
            this.options.secretsManager
                .getSecretValue({
                    SecretId: secretId,
                })
                .promise(),
        );

        const secrets = await Promise.all(resp);

        const response = secrets.reduce((acc, secret) => {
            const sec = JSON.parse(secret.SecretString);

            const allSecrets = {
                ...acc,
                ...sec,
            };
            return allSecrets;
        }, {});

        return response as T;
    }

    async getSecrets<T>(secretId: string) {
        const secret = await this.options.secretsManager
            .getSecretValue({
                SecretId: secretId,
            })
            .promise();

        return JSON.parse(secret.SecretString) as T;
    }
}
