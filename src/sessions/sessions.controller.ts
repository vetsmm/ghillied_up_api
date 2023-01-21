import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
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

@Controller('users/:userId/sessions')
export class SessionController {
    constructor(private sessionsService: SessionsService) {}

    /** Get sessions for a user */
    @Get()
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
    async get(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
    ): Promise<SessionDto> {
        return this.sessionsService.getSession(ctx, id);
    }

    /** Delete a session for a user */
    @Delete(':id')
    async remove(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
    ): Promise<SessionDto> {
        return this.sessionsService.deleteSession(ctx, id);
    }
}
