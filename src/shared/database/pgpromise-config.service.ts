import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as pgPromise from 'pg-promise';
import { NestPgpromiseOptionsFactory } from 'nestjs-pgpromise/dist/interfaces/nest-pgpromise-options-factory.interface';
import { NestPgpromiseOptions } from 'nestjs-pgpromise/dist/interfaces/nest-pgpromise-options.interface';

@Injectable()
export class PgPromiseConfigService implements NestPgpromiseOptionsFactory {
    constructor(private configService: ConfigService) {}

    createNestPgpromiseOptions(): NestPgpromiseOptions {
        const DATABASE_URL = this.configService.get('databaseUrl');
        return {
            connection: {
                connectionString: DATABASE_URL,
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
