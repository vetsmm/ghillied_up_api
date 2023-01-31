import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { ReqContext, RequestContext } from '../shared';
import { SessionDto } from './dtos/session.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthoritiesGuard } from '../auth/guards/authorities.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { Authorities } from '../auth/decorators/authority.decorator';
import { UserAuthority } from '@prisma/client';
import { SessionQueryInput } from './dtos/session-query-input';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionController {
    constructor(private sessionsService: SessionsService) {}

    /** Get sessions for a user */
    @Post('all')
    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @Authorities(UserAuthority.ROLE_USER)
    async getAllSessions(
        @ReqContext() ctx: RequestContext,
        @Body() query: SessionQueryInput,
    ): Promise<SessionDto[]> {
        return this.sessionsService.getSessions(ctx, {
            skip: query.skip,
            take: query.take,
            orderBy: query.orderBy,
            cursor: query.cursor,
            where: query.where,
        });
    }

    /** Get a session for a user */
    @Get(':id')
    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @Authorities(UserAuthority.ROLE_USER)
    async getSession(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
    ): Promise<SessionDto> {
        return this.sessionsService.getSession(ctx, id);
    }

    /** Delete a session for a user */
    @Delete(':id')
    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @Authorities(UserAuthority.ROLE_USER)
    async removeSession(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
    ): Promise<SessionDto> {
        return this.sessionsService.deleteSession(ctx, id);
    }

    /** Delete a session for a user */
    @Delete('delete/all')
    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @Authorities(UserAuthority.ROLE_USER)
    async removeAllPastSessions(
        @ReqContext() ctx: RequestContext,
    ): Promise<void> {
        await this.sessionsService.deletePastSessions(ctx);
    }
}
