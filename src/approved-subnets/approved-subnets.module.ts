import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApprovedSubnetController } from './approved-subnets.controller';
import { ApprovedSubnetsService } from './approved-subnets.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GeolocationModule } from '../shared/geolocation/geolocation.module';
import { AppLoggerModule } from '../shared/logger/logger.module';

@Module({
    imports: [AppLoggerModule, PrismaModule, ConfigModule, GeolocationModule],
    controllers: [ApprovedSubnetController],
    providers: [ApprovedSubnetsService],
})
export class ApprovedSubnetsModule {}
