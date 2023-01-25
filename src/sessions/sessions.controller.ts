import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import {
    CursorPipe,
    OptionalIntPipe,
    OrderByPipe,
    ReqContext,
    RequestContext,
    WherePipe,
} from '../shared';
import { SessionDto } from './dtos/session.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthoritiesGuard } from '../auth/guards/authorities.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { Authorities } from '../auth/decorators/authority.decorator';
import { UserAuthority } from '@prisma/client';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionController {
    constructor(private sessionsService: SessionsService) {}

    /** Get sessions for a user */
    @Get()
    @UseGuards(JwtAuthGuard, AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @Authorities(UserAuthority.ROLE_USER)
    async getAll(
        @ReqContext() ctx: RequestContext,
        @Query('skip', OptionalIntPipe) skip?: number,
        @Query('take', OptionalIntPipe) take?: number,
        @Query('cursor', CursorPipe) cursor?: Record<string, number | string>,
        @Query('where', WherePipe) where?: Record<string, number | string>,
        @Query('orderBy', OrderByPipe) orderBy?: Record<string, 'asc' | 'desc'>,
    ): Promise<SessionDto[]> {
        return this.sessionsService.getSessions(ctx, {
            skip,
            take,
            orderBy,
            cursor,
            where,
        });
    }

    /** Get a session for a user */
    @Get(':id')
    @UseGuards(JwtAuthGuard, AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @Authorities(UserAuthority.ROLE_USER)
    async get(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
    ): Promise<SessionDto> {
        return this.sessionsService.getSession(ctx, id);
    }

    /** Delete a session for a user */
    @Delete(':id')
    @UseGuards(JwtAuthGuard, AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @Authorities(UserAuthority.ROLE_USER)
    async remove(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
    ): Promise<SessionDto> {
        return this.sessionsService.deleteSession(ctx, id);
    }
}
