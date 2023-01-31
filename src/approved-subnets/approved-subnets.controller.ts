import {
    Controller,
    Delete,
    Get,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { UserAuthority } from '@prisma/client';

import { ApprovedSubnetsService } from './approved-subnets.service';
import {
    CursorPipe,
    OptionalIntPipe,
    OrderByPipe,
    ReqContext,
    RequestContext,
    WherePipe,
} from '../shared';
import { AuthoritiesGuard } from '../auth/guards/authorities.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Authorities } from '../auth/decorators/authority.decorator';
import { ApprovedSubnetDto } from './dtos/approved-subnet.dto';

@ApiTags('Approved Subnets')
@Controller('approved-subnets')
export class ApprovedSubnetController {
    constructor(private approvedSubnetsService: ApprovedSubnetsService) {}

    /** Get approved subnets for a user */
    @Get()
    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @Authorities(UserAuthority.ROLE_USER)
    async getAll(
        @ReqContext() ctx: RequestContext,
        @Query('skip', OptionalIntPipe) skip?: number,
        @Query('take', OptionalIntPipe) take?: number,
        @Query('cursor', CursorPipe) cursor?: Record<string, number | string>,
        @Query('where', WherePipe) where?: Record<string, number | string>,
        @Query('orderBy', OrderByPipe) orderBy?: Record<string, 'asc' | 'desc'>,
    ): Promise<ApprovedSubnetDto[]> {
        return this.approvedSubnetsService.getApprovedSubnets(
            ctx,
            ctx.user.id,
            {
                skip,
                take,
                orderBy,
                cursor,
                where,
            },
        );
    }

    /** Get an approved subnet for a user */
    @Get(':id')
    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @Authorities(UserAuthority.ROLE_USER)
    async get(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
    ): Promise<ApprovedSubnetDto> {
        return this.approvedSubnetsService.getApprovedSubnet(
            ctx,
            ctx.user.id,
            id,
        );
    }

    /** Delete an approved subnet for a user */
    @Delete(':id')
    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @Authorities(UserAuthority.ROLE_USER)
    async remove(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
    ): Promise<ApprovedSubnetDto> {
        return this.approvedSubnetsService.deleteApprovedSubnet(
            ctx,
            ctx.user.id,
            id,
        );
    }
}
