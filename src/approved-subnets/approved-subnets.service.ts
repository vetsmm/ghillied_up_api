import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Prisma } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import anonymize from 'ip-anonymize';
import {
    APPROVED_SUBNET_NOT_FOUND,
    RequestContext,
    UNAUTHORIZED_RESOURCE,
} from '../shared';
import { PrismaService } from '../prisma/prisma.service';
import { GeolocationService } from '../shared/geolocation/geolocation.service';
import { ApprovedSubnetDto } from './dtos/approved-subnet.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ApprovedSubnetsService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private geolocationService: GeolocationService,
    ) {}

    async getApprovedSubnets(
        ctx: RequestContext,
        userId: string,
        params: {
            skip?: number;
            take?: number;
            cursor?: Prisma.ApprovedSubnetWhereUniqueInput;
            where?: Prisma.ApprovedSubnetWhereInput;
            orderBy?: Prisma.ApprovedSubnetOrderByWithRelationAndSearchRelevanceInput;
        },
    ): Promise<ApprovedSubnetDto[]> {
        const { skip, take, cursor, where, orderBy } = params;
        try {
            const ApprovedSubnet = await this.prisma.approvedSubnet.findMany({
                skip,
                take,
                cursor,
                where: { ...where, user: { id: userId } },
                orderBy,
            });
            return plainToInstance(ApprovedSubnetDto, ApprovedSubnet, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            });
        } catch (error) {
            return [];
        }
    }

    async getApprovedSubnet(
        ctx: RequestContext,
        userId: string,
        id: string,
    ): Promise<ApprovedSubnetDto> {
        const approvedSubnet = await this.prisma.approvedSubnet.findUnique({
            where: { id },
        });
        if (!approvedSubnet)
            throw new NotFoundException(APPROVED_SUBNET_NOT_FOUND);
        if (approvedSubnet.userId !== userId)
            throw new UnauthorizedException(UNAUTHORIZED_RESOURCE);
        if (!approvedSubnet)
            throw new NotFoundException(APPROVED_SUBNET_NOT_FOUND);

        return plainToInstance(ApprovedSubnetDto, approvedSubnet, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async deleteApprovedSubnet(
        ctx: RequestContext,
        userId: string,
        id: string,
    ): Promise<ApprovedSubnetDto> {
        const testApprovedSubnet = await this.prisma.approvedSubnet.findUnique({
            where: { id },
        });
        if (!testApprovedSubnet)
            throw new NotFoundException(APPROVED_SUBNET_NOT_FOUND);
        if (testApprovedSubnet.userId !== userId)
            throw new UnauthorizedException(UNAUTHORIZED_RESOURCE);
        const approvedSubnet = await this.prisma.approvedSubnet.delete({
            where: { id },
        });
        return plainToInstance(ApprovedSubnetDto, approvedSubnet, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async approveNewSubnet(
        userId: string,
        ipAddress: string,
    ): Promise<ApprovedSubnetDto> {
        const subnet = await hash(
            anonymize(ipAddress),
            this.configService.get<number>('security.saltRounds') ?? 10,
        );
        const location = await this.geolocationService.getLocation(ipAddress);
        const approved = await this.prisma.approvedSubnet.create({
            data: {
                user: { connect: { id: userId } },
                subnet,
                city: location?.city?.names?.en,
                region: location?.subdivisions?.pop()?.names?.en,
                timezone: location?.location?.time_zone,
                countryCode: location?.country?.iso_code,
            },
        });
        return plainToInstance(ApprovedSubnetDto, approved, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    /**
     * Upsert a new subnet
     * If this subnet already exists, skip; otherwise add it
     */
    async upsertNewSubnet(
        userId: string,
        ipAddress: string,
    ): Promise<ApprovedSubnetDto> {
        const subnet = anonymize(ipAddress);
        const previousSubnets = await this.prisma.approvedSubnet.findMany({
            where: { user: { id: userId } },
        });
        for await (const item of previousSubnets) {
            if (await compare(subnet, item.subnet))
                return plainToInstance(ApprovedSubnetDto, item, {
                    excludeExtraneousValues: true,
                    enableImplicitConversion: true,
                });
        }
        return this.approveNewSubnet(userId, ipAddress);
    }
}
