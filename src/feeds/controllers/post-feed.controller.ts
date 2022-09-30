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
    HttpCode,
    HttpStatus,
    Post,
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
    FeedInputDto,
} from '../../shared';
import { PostFeedService } from '../services/post-feed.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthoritiesGuard } from '../../auth/guards/authorities.guard';
import { Authorities } from '../../auth/decorators/authority.decorator';
import { UserAuthority } from '@prisma/client';
import { PostListingDto } from '../../posts/dtos/post-listing.dto';

@ApiTags('feeds')
@Controller('feeds')
export class PostFeedController {
    constructor(
        private readonly logger: AppLogger,
        private readonly postFeedService: PostFeedService,
    ) {
        this.logger.setContext(PostFeedController.name);
    }

    // create post
    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Post()
    @ApiOperation({
        summary: 'Retrieves the current users feed of posts',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse([PostListingDto]),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        type: BaseApiErrorResponse,
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_VERIFIED_MILITARY, UserAuthority.ROLE_USER)
    async getFeed(
        @ReqContext() ctx: RequestContext,
        @Body() body: FeedInputDto,
    ): Promise<BaseApiResponse<PostListingDto[]>> {
        const { posts, pageInfo } = await this.postFeedService.getFeed(
            ctx,
            body,
        );
        return {
            data: posts,
            meta: pageInfo,
        };
    }
}
