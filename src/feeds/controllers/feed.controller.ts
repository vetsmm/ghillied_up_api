import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    ClassSerializerInterceptor,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
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
} from '../../shared';
import { PostFeedService } from '../services/post-feed.service';
import { AuthoritiesGuard } from '../../auth/guards/authorities.guard';
import { Authorities } from '../../auth/decorators/authority.decorator';
import { UserAuthority } from '@prisma/client';
import { PostFeedDto } from '../dtos/post-feed.dto';
import { BookmarkPostFeedDto } from '../dtos/bookmark-post-feed.dto';
import { BookmarkPostFeedService } from '../services/bookmark-post-feed.service';
import { ActiveUserGuard } from '../../auth/guards/active-user.guard';

@ApiTags('feeds')
@Controller('feeds')
export class FeedController {
    constructor(
        private readonly logger: AppLogger,
        private readonly postFeedService: PostFeedService,
        private readonly bookmarkPostFeedService: BookmarkPostFeedService,
    ) {
        this.logger.setContext(FeedController.name);
    }

    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('user')
    @ApiOperation({
        summary: 'Retrieves the current users feed of posts',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse([PostFeedDto]),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        type: BaseApiErrorResponse,
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_VERIFIED_MILITARY, UserAuthority.ROLE_USER)
    async getUserFeed(
        @ReqContext() ctx: RequestContext,
        @Query('page') page?: number,
        @Query('take') take?: number,
    ): Promise<BaseApiResponse<PostFeedDto[]>> {
        const results = await this.postFeedService.getUserFeed(ctx, page, take);
        return {
            data: results,
            meta: {},
        };
    }

    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('user/personal')
    @ApiOperation({
        summary:
            'Retrieves the current users posts that they have made across ghillies',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse([PostFeedDto]),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        type: BaseApiErrorResponse,
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_VERIFIED_MILITARY, UserAuthority.ROLE_USER)
    async getUsersPersonalFeed(
        @ReqContext() ctx: RequestContext,
        @Query('page') page?: number,
        @Query('take') take?: number,
    ): Promise<BaseApiResponse<PostFeedDto[]>> {
        const results = await this.postFeedService.getUsersPersonalFeed(
            ctx,
            page,
            take,
        );
        return {
            data: results,
            meta: {},
        };
    }

    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('user/bookmarks')
    @ApiOperation({
        summary: 'Retrieves the current users bookmarked posts',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse([BookmarkPostFeedDto]),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        type: BaseApiErrorResponse,
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_VERIFIED_MILITARY, UserAuthority.ROLE_USER)
    async getUsersBookmarkedPostFeed(
        @ReqContext() ctx: RequestContext,
        @Query('page') page?: number,
        @Query('take') take?: number,
    ): Promise<BaseApiResponse<BookmarkPostFeedDto[]>> {
        const results =
            await this.bookmarkPostFeedService.getUsersBookmarkedPostFeed(
                ctx,
                page,
                take,
            );
        return {
            data: results,
            meta: {},
        };
    }

    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('hashtag/:tagName')
    @ApiOperation({
        summary: 'Retrieves the post feed of a hashtag',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse([PostFeedDto]),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        type: BaseApiErrorResponse,
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_VERIFIED_MILITARY, UserAuthority.ROLE_USER)
    async getHashtagFeed(
        @ReqContext() ctx: RequestContext,
        @Param('tagName') tagName: string,
        @Query('page') page?: number,
        @Query('take') take?: number,
    ): Promise<PostFeedDto[]> {
        return await this.postFeedService.getHashtagPostFeed(
            ctx,
            tagName,
            page,
            take,
        );
    }

    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('ghillie/:ghillieId')
    @ApiOperation({
        summary: 'Retrieves the post feed of a ghillie',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse([PostFeedDto]),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        type: BaseApiErrorResponse,
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_VERIFIED_MILITARY, UserAuthority.ROLE_USER)
    async getGhilliePostFeed(
        @ReqContext() ctx: RequestContext,
        @Param('ghillieId') ghillieId: string,
        @Query('page') page?: number,
        @Query('take') take?: number,
    ): Promise<BaseApiResponse<PostFeedDto[]>> {
        const results = await this.postFeedService.getGhilliePostFeed(
            ctx,
            ghillieId,
            page,
            take,
        );
        return {
            data: results,
            meta: {},
        };
    }
}
