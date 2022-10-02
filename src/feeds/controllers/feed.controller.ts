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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthoritiesGuard } from '../../auth/guards/authorities.guard';
import { Authorities } from '../../auth/decorators/authority.decorator';
import { UserAuthority } from '@prisma/client';
import { PostFeedDto } from '../dtos/post-feed.dto';

@ApiTags('feeds')
@Controller('feeds')
export class FeedController {
    constructor(
        private readonly logger: AppLogger,
        private readonly postFeedService: PostFeedService,
    ) {
        this.logger.setContext(FeedController.name);
    }

    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
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

    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
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
