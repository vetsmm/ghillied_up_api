import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as pgPromise from 'pg-promise';
import { NestPgpromiseOptionsFactory } from 'nestjs-pgpromise/dist/interfaces/nest-pgpromise-options-factory.interface';
import { NestPgpromiseOptions } from 'nestjs-pgpromise/dist/interfaces/nest-pgpromise-options.interface';
import { AWSSecretsService } from '../secrets-manager';

@Injectable()
export class PgPromiseConfigService implements NestPgpromiseOptionsFactory {
    constructor(
        private configService: ConfigService,
        private secretsService: AWSSecretsService,
    ) {}

    private async getDatabaseUrl() {
        if (this.configService.get('appEnv') === 'DEV') {
            return this.configService.get('databaseUrl');
        }
        const databaseSecrets = await this.secretsService.getSecrets<{
            username: string;
            password: string;
            host: string;
            port: string;
            dbname: string;
            dbInstanceIdentifier: string;
            engine: string;
        }>(this.configService.get('secretsSources.database'));

        return `postgres://${databaseSecrets.username}:${databaseSecrets.password}@${databaseSecrets.host}:${databaseSecrets.port}/${databaseSecrets.dbname}`;
    }
    async createNestPgpromiseOptions(): Promise<NestPgpromiseOptions> {
        const databaseUrl = await this.getDatabaseUrl();
        return {
            connection: {
                connectionString: databaseUrl,
                connectionTimeoutMillis: 5000,
                idleTimeoutMillis: 10000,
            },
            initOptions: {
                receive: (data, result, e) => {
                    this.camelizeColumns(data);
                },
            },
        };
    }

    private camelizeColumns(data) {
        const template = data[0];
        for (const prop in template) {
            const camel = pgPromise.utils.camelize(prop);
            if (!(camel in template)) {
                for (let i = 0; i < data.length; i++) {
                    const d = data[i];
                    d[camel] = d[prop];
                    delete d[prop];
                }
            }
        }
    }
}
