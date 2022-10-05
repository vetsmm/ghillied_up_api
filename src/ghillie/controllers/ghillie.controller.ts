import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    AppLogger,
    BaseApiErrorResponse,
    BaseApiResponse,
    ReqContext,
    RequestContext,
    SwaggerBaseApiResponse,
    GhillieSearchCriteria,
} from '../../shared';
import { GhillieService } from '../services/ghillie.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthoritiesGuard } from '../../auth/guards/authorities.guard';
import { CreateGhillieInputDto } from '../dtos/ghillie/create-ghillie-input.dto';
import { GhillieDetailDto } from '../dtos/ghillie/ghillie-detail.dto';
import { Authorities } from '../../auth/decorators/authority.decorator';
import { UserAuthority } from '@prisma/client';
import { UpdateGhillieDto } from '../dtos/ghillie/update-ghillie.dto';
import { GhillieOwnershipTransferDto } from '../dtos/members/ghillie-ownership-transfer.dto';
import { GhillieUserDto } from '../dtos/members/ghillie-user.dto';
import { TopicNamesDto } from '../dtos/topic/topic-names.dto';
import { TopicIdsDto } from '../dtos/topic/topic-ids.dto';

@ApiTags('ghillies')
@Controller('ghillies')
export class GhillieController {
    constructor(
        private readonly logger: AppLogger,
        private readonly ghillieService: GhillieService,
    ) {
        this.logger.setContext(GhillieController.name);
    }

    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Post()
    @ApiOperation({
        summary: 'Creates a new Ghillie',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(GhillieDetailDto),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        type: BaseApiErrorResponse,
    })
    @HttpCode(HttpStatus.CREATED)
    @Authorities(UserAuthority.ROLE_ADMIN)
    async createGhillie(
        @ReqContext() ctx: RequestContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Body() createGhillieDto: CreateGhillieInputDto,
    ): Promise<BaseApiResponse<GhillieDetailDto>> {
        this.logger.log(ctx, `${this.createGhillie.name} was called`);

        const ghillie = await this.ghillieService.createGhillie(
            ctx,
            createGhillieDto,
        );
        return {
            data: ghillie,
            meta: {},
        };
    }

    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @Authorities(UserAuthority.ROLE_USER)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Get(':id')
    @ApiOperation({
        summary: 'Get single Ghillie',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(GhillieDetailDto),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
    })
    @HttpCode(HttpStatus.OK)
    async getGhillie(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
    ): Promise<BaseApiResponse<GhillieDetailDto>> {
        this.logger.log(ctx, `${this.getGhillie.name} was called`);

        const ghillie = await this.ghillieService.getGhillie(ctx, id);
        return {
            data: ghillie,
            meta: {},
        };
    }

    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @Authorities(UserAuthority.ROLE_USER)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Get()
    @ApiOperation({
        summary: 'Get all Ghillies',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse([GhillieDetailDto]),
    })
    @HttpCode(HttpStatus.OK)
    async getAllGhillies(
        @ReqContext() ctx: RequestContext,
        @Query('take') take = 25,
        @Query('cursor') cursor?: string,
    ): Promise<BaseApiResponse<GhillieDetailDto[]>> {
        this.logger.log(ctx, `${this.getAllGhillies.name} was called`);

        const { ghillies, pageInfo } = await this.ghillieService.getGhillies(
            ctx,
            {
                take: take,
                cursor: cursor,
            },
        );
        return {
            data: ghillies,
            meta: pageInfo,
        };
    }

    // Get ghillies for current user
    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @Authorities(UserAuthority.ROLE_USER)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('my/all')
    @ApiOperation({
        summary: 'Get all Ghillies that the current user is a member of',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse([GhillieDetailDto]),
    })
    @HttpCode(HttpStatus.OK)
    async getCurrentUsersGhillies(
        @ReqContext() ctx: RequestContext,
        @Query('take') take = 10,
        @Query('cursor') cursor?: string,
    ): Promise<BaseApiResponse<GhillieDetailDto[]>> {
        this.logger.log(ctx, `${this.getCurrentUsersGhillies.name} was called`);

        const { ghillies, pageInfo } =
            await this.ghillieService.getGhilliesForCurrentUser(
                ctx,
                take,
                cursor,
            );
        return {
            data: ghillies,
            meta: pageInfo,
        };
    }

    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @Authorities(UserAuthority.ROLE_USER)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('all')
    @ApiOperation({
        summary: 'Get all Ghillies w/ filters',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse([GhillieDetailDto]),
    })
    @HttpCode(HttpStatus.OK)
    async getAllGhilliesWithFilter(
        @ReqContext() ctx: RequestContext,
        @Body() requestQuery: GhillieSearchCriteria,
    ): Promise<BaseApiResponse<GhillieDetailDto[]>> {
        this.logger.log(ctx, `${this.getAllGhillies.name} was called`);

        const { ghillies, pageInfo } = await this.ghillieService.getGhillies(
            ctx,
            requestQuery,
        );
        return {
            data: ghillies,
            meta: pageInfo,
        };
    }

    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @Authorities(UserAuthority.ROLE_ADMIN)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Put(':id')
    @ApiOperation({
        summary: 'Update a Ghillie',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(GhillieDetailDto),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        type: BaseApiErrorResponse,
    })
    @HttpCode(HttpStatus.OK)
    async updateGhillie(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
        @Body() updateGhillieDto: UpdateGhillieDto,
    ): Promise<BaseApiResponse<GhillieDetailDto>> {
        this.logger.log(ctx, `${this.updateGhillie.name} was called`);

        const ghillie = await this.ghillieService.updateGhillie(
            ctx,
            id,
            updateGhillieDto,
        );
        return {
            data: ghillie,
            meta: {},
        };
    }

    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @Authorities(UserAuthority.ROLE_ADMIN)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Delete(':id')
    @ApiOperation({
        summary: 'Delete a Ghillie',
    })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteGhillie(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
    ): Promise<void> {
        this.logger.log(ctx, `${this.deleteGhillie.name} was called`);

        await this.ghillieService.deleteGhillie(ctx, id);
    }

    // Join a Ghillie
    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @Authorities(UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Put(':id/join')
    @ApiOperation({
        summary: 'Join a Ghillie',
    })
    @ApiResponse({
        status: HttpStatus.OK,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        type: BaseApiErrorResponse,
    })
    @HttpCode(HttpStatus.OK)
    async joinGhillie(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
    ): Promise<void> {
        this.logger.log(ctx, `${this.joinGhillie.name} was called`);

        await this.ghillieService.joinGhillie(ctx, id);
    }

    // Leave a Ghillie
    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @Authorities(UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Put(':id/leave')
    @ApiOperation({
        summary: 'Leave a Ghillie',
    })
    @ApiResponse({
        status: HttpStatus.OK,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
    })
    @HttpCode(HttpStatus.OK)
    async leaveGhillie(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
    ): Promise<void> {
        this.logger.log(ctx, `${this.leaveGhillie.name} was called`);

        await this.ghillieService.leaveGhillie(ctx, id);
    }

    // Transfer ownership of a Ghillie
    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @Authorities(UserAuthority.ROLE_USER)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Put(':id/transfer-ownership')
    @ApiOperation({
        summary: 'Transfer ownership of a Ghillie',
    })
    @ApiResponse({
        status: HttpStatus.OK,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
    })
    @HttpCode(HttpStatus.OK)
    async transferOwnership(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
        @Body() transferOwnershipDto: GhillieOwnershipTransferDto,
    ): Promise<void> {
        this.logger.log(ctx, `${this.transferOwnership.name} was called`);

        await this.ghillieService.transferOwnership(
            ctx,
            id,
            transferOwnershipDto.transferToUserId,
        );
    }

    // Add Moderator Role to user
    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @Authorities(UserAuthority.ROLE_USER)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Put(':id/add-moderator-role')
    @ApiOperation({
        summary: 'Add Moderator Role to user',
    })
    @ApiResponse({
        status: HttpStatus.OK,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
    })
    @HttpCode(HttpStatus.OK)
    async addModerator(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
        @Body() addModeratorDto: GhillieUserDto,
    ): Promise<void> {
        this.logger.log(ctx, `${this.addModerator.name} was called`);

        await this.ghillieService.addModerator(ctx, id, addModeratorDto.userId);
    }

    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @Authorities(UserAuthority.ROLE_USER)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Put(':id/remove-moderator-role')
    @ApiOperation({
        summary: 'Remove Moderator Role from user',
    })
    @ApiResponse({
        status: HttpStatus.OK,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
    })
    @HttpCode(HttpStatus.OK)
    async removeModerator(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
        @Body() removeModeratorDto: GhillieUserDto,
    ): Promise<void> {
        this.logger.log(ctx, `${this.removeModerator.name} was called`);

        await this.ghillieService.removeModerator(
            ctx,
            id,
            removeModeratorDto.userId,
        );
    }

    // Ban a user from a Ghillie
    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @Authorities(UserAuthority.ROLE_USER)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Put(':id/ban-user')
    @ApiOperation({
        summary: 'Ban a user from a Ghillie',
    })
    @ApiResponse({
        status: HttpStatus.OK,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
    })
    @HttpCode(HttpStatus.OK)
    async banUser(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
        @Body() banUserDto: GhillieUserDto,
    ): Promise<void> {
        this.logger.log(ctx, `${this.banUser.name} was called`);

        await this.ghillieService.banUser(ctx, id, banUserDto.userId);
    }

    // Unban a user from a Ghillie
    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @Authorities(UserAuthority.ROLE_USER)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Put(':id/unban-user')
    @ApiOperation({
        summary: 'Unban a user from a Ghillie',
    })
    @ApiResponse({
        status: HttpStatus.OK,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
    })
    @HttpCode(HttpStatus.OK)
    async unbanUser(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
        @Body() unbanUserDto: GhillieUserDto,
    ): Promise<void> {
        this.logger.log(ctx, `${this.unbanUser.name} was called`);

        await this.ghillieService.unbanUser(ctx, id, unbanUserDto.userId);
    }

    // Add topics
    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @Authorities(UserAuthority.ROLE_USER)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Put(':id/add-topics')
    @ApiOperation({
        summary: 'Add topics to a Ghillie',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(GhillieDetailDto),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
    })
    @HttpCode(HttpStatus.OK)
    async addTopics(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
        @Body() addTopicsDto: TopicNamesDto,
    ): Promise<BaseApiResponse<GhillieDetailDto>> {
        this.logger.log(ctx, `${this.addTopics.name} was called`);

        const ghillieDetail = await this.ghillieService.addTopics(
            ctx,
            id,
            addTopicsDto.topicNames,
        );

        return {
            data: ghillieDetail,
            meta: {},
        };
    }

    // Delete topics
    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @Authorities(UserAuthority.ROLE_USER)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Put(':id/delete-topics')
    @ApiOperation({
        summary: 'Deletes topics to a Ghillie',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(GhillieDetailDto),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
    })
    @HttpCode(HttpStatus.OK)
    async deleteTopics(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
        @Body() deleteTopicsDto: TopicIdsDto,
    ): Promise<BaseApiResponse<GhillieDetailDto>> {
        this.logger.log(ctx, `${this.addTopics.name} was called`);

        const ghillieDetail = await this.ghillieService.removeTopics(
            ctx,
            id,
            deleteTopicsDto.topicIds,
        );

        return {
            data: ghillieDetail,
            meta: {},
        };
    }
}
