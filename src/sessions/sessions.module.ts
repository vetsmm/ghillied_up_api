import { Module } from '@nestjs/common';
import { SessionController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [SessionController],
    providers: [SessionsService],
})
export class SessionsModule {}
