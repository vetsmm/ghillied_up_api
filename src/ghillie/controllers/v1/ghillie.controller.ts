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
    Patch,
    Post,
    Put,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    AppLogger,
    BaseApiErrorResponse,
    BaseApiResponse,
    GhillieSearchCriteria,
    ReqContext,
    RequestContext,
    SwaggerBaseApiResponse,
} from '../../../shared';
import { GhillieService } from '../../services/ghillie.service';
import { AuthoritiesGuard } from '../../../auth/guards/authorities.guard';
import { CreateGhillieInputDto } from '../../dtos/ghillie/create-ghillie-input.dto';
import { GhillieDetailDto } from '../../dtos/ghillie/ghillie-detail.dto';
import { Authorities } from '../../../auth/decorators/authority.decorator';
import { UserAuthority } from '@prisma/client';
import { UpdateGhillieDto } from '../../dtos/ghillie/update-ghillie.dto';
import { GhillieOwnershipTransferDto } from '../../dtos/members/ghillie-ownership-transfer.dto';
import { GhillieUserDto } from '../../dtos/members/ghillie-user.dto';
import ImageFilesInterceptor from '../../../shared/interceptors/image-file.interceptor';
import { ActiveUserGuard } from '../../../auth/guards/active-user.guard';
import { CombinedGhilliesDto } from '../../dtos/ghillie/combined-ghillies.dto';
import { GhillieMemberSettingsUpdateDto } from '../../dtos/members/ghillie-member-settings-update.dto';
import { GhillieMemberDto } from '../../dtos/members/ghillie-member.dto';

@ApiTags('ghillies')
@Controller('ghillies')
export class GhillieController {
    constructor(
        private readonly logger: AppLogger,
        private readonly ghillieService: GhillieService,
    ) {
        this.logger.setContext(GhillieController.name);
    }

    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
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
    @HttpCode(HttpStatus.CREATED)
    @Authorities(UserAuthority.ROLE_VERIFIED_MILITARY, UserAuthority.ROLE_ADMIN)
    async createGhillie(
        @ReqContext() ctx: RequestContext,
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

    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @Put(':id')
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({
        summary: 'Update a Ghillie',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(GhillieDetailDto),
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_VERIFIED_MILITARY, UserAuthority.ROLE_ADMIN)
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

    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @UseInterceptors(
        ImageFilesInterceptor({
            fieldName: 'image',
        }),
    )
    @Put(':id/logo')
    @ApiOperation({
        summary: "Update a Ghillie's logo",
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_VERIFIED_MILITARY, UserAuthority.ROLE_ADMIN)
    async updateGhillieLogo(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
        @UploadedFile() image: Express.Multer.File,
    ): Promise<GhillieDetailDto> {
        this.logger.log(ctx, `${this.updateGhillieLogo.name} was called`);

        return await this.ghillieService.updateGhillieLogo(ctx, id, image);
    }

    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @Patch(':id/member-settings')
    @ApiOperation({
        summary: "Update a Ghillie Member's Settings",
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_VERIFIED_MILITARY, UserAuthority.ROLE_ADMIN)
    async updateMemberSettings(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
        @Body() memberSettings: GhillieMemberSettingsUpdateDto,
    ): Promise<GhillieMemberDto> {
        this.logger.log(ctx, `${this.updateMemberSettings.name} was called`);

        return await this.ghillieService.updateMemberSettings(
            ctx,
            id,
            memberSettings,
        );
    }

    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @Get(':id/member-settings')
    @ApiOperation({
        summary: "Get a Ghillie Member's Settings",
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_VERIFIED_MILITARY, UserAuthority.ROLE_ADMIN)
    async getMemberSettings(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
    ): Promise<GhillieMemberDto> {
        this.logger.log(ctx, `${this.getMemberSettings.name} was called`);

        return await this.ghillieService.getMemberSettings(ctx, id);
    }

    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
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

    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @Authorities(UserAuthority.ROLE_USER)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('invite-code/:inviteCode')
    @ApiOperation({
        summary: 'Get single Ghillie',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: GhillieDetailDto,
    })
    @HttpCode(HttpStatus.OK)
    async getGhillieByInviteCode(
        @ReqContext() ctx: RequestContext,
        @Param('inviteCode') inviteCode: string,
    ): Promise<GhillieDetailDto> {
        this.logger.log(ctx, `${this.getGhillieByInviteCode.name} was called`);

        return await this.ghillieService.getGhillieByInviteCode(
            ctx,
            inviteCode,
        );
    }

    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
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
    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
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

    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @Authorities(UserAuthority.ROLE_USER)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('metrics/members')
    @ApiOperation({
        summary: 'Get popular ghillies (by number of members)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: GhillieDetailDto,
    })
    @HttpCode(HttpStatus.OK)
    async getPopularGhilliesByMembers(
        @ReqContext() ctx: RequestContext,
        @Query('limit') limit = 10,
    ): Promise<GhillieDetailDto[]> {
        this.logger.log(ctx, `${this.getCurrentUsersGhillies.name} was called`);

        return await this.ghillieService.getPopularGhilliesByMembers(
            ctx,
            limit,
        );
    }

    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @Authorities(UserAuthority.ROLE_USER)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('metrics/trending-posts')
    @ApiOperation({
        summary: 'Get popular ghillies (by recent post count)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: GhillieDetailDto,
    })
    @HttpCode(HttpStatus.OK)
    async getPopularGhilliesByTrendingPosts(
        @ReqContext() ctx: RequestContext,
        @Query('limit') limit = 10,
    ): Promise<GhillieDetailDto[]> {
        this.logger.log(
            ctx,
            `${this.getPopularGhilliesByTrendingPosts.name} was called`,
        );

        return await this.ghillieService.getPopularGhilliesByTrendingPosts(
            ctx,
            limit,
        );
    }

    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @Authorities(UserAuthority.ROLE_USER)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('metrics/newest')
    @ApiOperation({
        summary: 'Get newest ghillies',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: GhillieDetailDto,
    })
    @HttpCode(HttpStatus.OK)
    async getNewestGhillies(
        @ReqContext() ctx: RequestContext,
        @Query('limit') limit = 10,
    ): Promise<GhillieDetailDto[]> {
        this.logger.log(ctx, `${this.getNewestGhillies.name} was called`);

        return await this.ghillieService.getNewestGhillies(ctx, limit);
    }

    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @Authorities(UserAuthority.ROLE_USER)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('bulk/combined')
    @ApiOperation({
        summary: 'Get newest ghillies',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: CombinedGhilliesDto,
    })
    @HttpCode(HttpStatus.OK)
    async getCombinedGhillies(
        @ReqContext() ctx: RequestContext,
        @Query('limit') limit = 10,
    ): Promise<CombinedGhilliesDto> {
        this.logger.log(ctx, `${this.getNewestGhillies.name} was called`);

        return await this.ghillieService.getCombinedGhillies(ctx, limit);
    }

    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
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

    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @Authorities(UserAuthority.ROLE_ADMIN, UserAuthority.ROLE_VERIFIED_MILITARY)
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
    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
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

    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @Authorities(UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Put('join/:inviteCode')
    @ApiOperation({
        summary: 'Join a Ghillie by invite code',
    })
    @ApiResponse({
        status: HttpStatus.OK,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        type: BaseApiErrorResponse,
    })
    @HttpCode(HttpStatus.OK)
    async joinGhillieWithInviteCode(
        @ReqContext() ctx: RequestContext,
        @Param('inviteCode') inviteCode: string,
    ): Promise<GhillieDetailDto> {
        this.logger.log(
            ctx,
            `${this.joinGhillieWithInviteCode.name} was called`,
        );

        return await this.ghillieService.joinGhillieWithInviteCode(
            ctx,
            inviteCode,
        );
    }

    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @Authorities(UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Put(':id/generate-invite-code')
    @ApiOperation({
        summary: 'Generate a new invite code for a Ghillie',
    })
    @ApiResponse({
        status: HttpStatus.OK,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        type: BaseApiErrorResponse,
    })
    @HttpCode(HttpStatus.OK)
    async generateInviteCode(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
    ): Promise<void> {
        this.logger.log(ctx, `${this.generateInviteCode.name} was called`);

        await this.ghillieService.generateInviteCode(ctx, id);
    }

    // Leave a Ghillie
    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
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
    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
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
    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
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

    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
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
    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
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
    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
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
    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @Authorities(UserAuthority.ROLE_USER)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Put(':id/add-topics')
    @ApiOperation({
        summary: 'Add topics to a Ghillie',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: GhillieDetailDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
    })
    @HttpCode(HttpStatus.OK)
    async addTopics(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
        @Body() topicNames: string[],
    ): Promise<GhillieDetailDto> {
        this.logger.log(ctx, `${this.addTopics.name} was called`);

        return await this.ghillieService.addTopics(ctx, id, topicNames);
    }

    // Delete topics
    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @Authorities(UserAuthority.ROLE_USER)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Put(':id/delete-topics')
    @ApiOperation({
        summary: 'Deletes topics from a Ghillie',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: GhillieDetailDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
    })
    @HttpCode(HttpStatus.OK)
    async deleteTopics(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
        @Body() topicNames: string[],
    ): Promise<GhillieDetailDto> {
        this.logger.log(ctx, `${this.deleteTopics.name} was called`);

        return await this.ghillieService.removeTopics(ctx, id, topicNames);
    }
}
