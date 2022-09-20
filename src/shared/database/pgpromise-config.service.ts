import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestPgpromiseOptionsFactory } from "nestjs-pgpromise/dist/interfaces/nest-pgpromise-options-factory.interface";
import { NestPgpromiseOptions } from "nestjs-pgpromise/dist/interfaces/nest-pgpromise-options.interface";

@Injectable()
export class PgPromiseConfigService implements NestPgpromiseOptionsFactory {
    constructor(private configService: ConfigService) {
    }

    createNestPgpromiseOptions(): NestPgpromiseOptions {
        const DATABASE_URL = this.configService.get("databaseUrl");
        return {
            connection: DATABASE_URL
        }
    }
}
