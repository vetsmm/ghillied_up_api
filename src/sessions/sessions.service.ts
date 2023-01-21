import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { SessionDto } from './dtos/session.dto';
import {
    RequestContext,
    SESSION_NOT_FOUND,
    UNAUTHORIZED_RESOURCE,
} from '../shared';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SessionsService {
    constructor(private prisma: PrismaService) {}

    async getSessions(
        ctx: RequestContext,
        params: {
            skip?: number;
            take?: number;
            cursor?: Prisma.SessionWhereUniqueInput;
            where?: Prisma.SessionWhereInput;
            orderBy?: Prisma.SessionOrderByWithRelationAndSearchRelevanceInput;
        },
    ): Promise<SessionDto[]> {
        const { skip, take, cursor, where, orderBy } = params;
        try {
            const sessions = await this.prisma.session.findMany({
                skip,
                take,
                cursor,
                where: { ...where, user: { id: ctx.user.id } },
                orderBy,
            });
            return sessions.map((i) => {
                return plainToInstance(
                    SessionDto,
                    {
                        ...i,
                        isCurrentSession: ctx.user.sessionId === i.id,
                    },
                    {
                        excludeExtraneousValues: true,
                        enableImplicitConversion: true,
                    },
                );
            });
        } catch (error) {
            return [];
        }
    }

    async getSession(ctx: RequestContext, id: string): Promise<SessionDto> {
        const session = await this.prisma.session.findUnique({
            where: { id },
        });
        if (!session) throw new NotFoundException(SESSION_NOT_FOUND);
        if (session.userId !== ctx.user.id)
            throw new UnauthorizedException(UNAUTHORIZED_RESOURCE);
        if (!session) throw new NotFoundException(SESSION_NOT_FOUND);
        return plainToInstance(
            SessionDto,
            {
                ...session,
                isCurrentSession: ctx.user?.sessionId === session.id,
            },
            {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            },
        );
    }

    async deleteSession(ctx: RequestContext, id: string): Promise<SessionDto> {
        const testSession = await this.prisma.session.findUnique({
            where: { id },
        });
        if (!testSession) throw new NotFoundException(SESSION_NOT_FOUND);
        if (testSession.userId !== ctx.user.id)
            throw new UnauthorizedException(UNAUTHORIZED_RESOURCE);
        const session = await this.prisma.session.delete({
            where: { id },
        });
        return plainToInstance(SessionDto, session, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }
}
