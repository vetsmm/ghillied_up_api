import { INestApplication, Injectable } from '@nestjs/common';
import { ApprovedSubnet, PrismaClient, User } from '@prisma/client';
import { Expose } from './prisma.interface';

@Injectable()
export class PrismaService extends PrismaClient {
    async enableShutdownHooks(app: INestApplication) {
        this.$on('beforeExit', async () => {
            await app.close();
        });
    }

    expose<T>(item: T): Expose<T> {
        if (!item) return {} as T;
        if ((item as any as Partial<User>).password)
            (item as any).hasPassword = true;
        delete (item as any as Partial<User>).password;
        // delete ((item as any) as Partial<User>).twoFactorSecret;
        delete (item as any as Partial<ApprovedSubnet>).subnet;
        return item;
    }
}
