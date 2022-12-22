import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
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
    ParseIntPipe,
    Patch,
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
    PageInfo,
    ReqContext,
    RequestContext,
    SwaggerBaseApiResponse,
    PostSearchCriteria,
} from '../../shared';
import { PostService } from '../services/post.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthoritiesGuard } from '../../auth/guards/authorities.guard';
import { Authorities } from '../../auth/decorators/authority.decorator';
import { UserAuthority } from '@prisma/client';
import { CreatePostInputDto } from '../dtos/create-post-input.dto';
import { PostDetailDto } from '../dtos/post-detail.dto';
import { UpdatePostInputDto } from '../dtos/update-post-input.dto';
import { PostListingDto } from '../dtos/post-listing.dto';
import { PostBookmarkService } from '../services/post-bookmark.service';
import { ActiveUserGuard } from '../../auth/guards/active-user.guard';

@ApiTags('posts')
@Controller('posts')
export class PostController {
    constructor(
        private readonly logger: AppLogger,
        private readonly postService: PostService,
        private readonly bookmarkService: PostBookmarkService,
    ) {
        this.logger.setContext(PostController.name);
    }

    // create post
    @UseGuards(JwtAuthGuard, AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Post()
    @ApiOperation({
        summary: 'Creates a new Post',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(PostDetailDto),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        type: BaseApiErrorResponse,
    })
    @HttpCode(HttpStatus.CREATED)
    @Authorities(UserAuthority.ROLE_VERIFIED_MILITARY, UserAuthority.ROLE_USER)
    async createPost(
        @ReqContext() ctx: RequestContext,
        @Body() postDto: CreatePostInputDto,
    ): Promise<BaseApiResponse<PostDetailDto>> {
        this.logger.log(ctx, `${this.createPost.name} was called`);
        const post = await this.postService.createPost(ctx, postDto);
        return {
            data: post,
            meta: {},
        };
    }

    // update post
    @UseGuards(JwtAuthGuard, AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Patch(':id')
    @ApiOperation({
        summary: 'Updates a Post',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(PostDetailDto),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_VERIFIED_MILITARY, UserAuthority.ROLE_USER)
    async updatePost(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
        @Body() postDto: UpdatePostInputDto,
    ): Promise<BaseApiResponse<PostDetailDto>> {
        this.logger.log(ctx, `${this.updatePost.name} was called`);
        const post = await this.postService.updatePost(ctx, id, postDto);
        return {
            data: post,
            meta: {},
        };
    }

    @UseGuards(JwtAuthGuard, AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Get(':id')
    @ApiOperation({
        summary: 'Gets a Post by id',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(PostDetailDto),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY)
    async getPostById(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
    ): Promise<BaseApiResponse<PostDetailDto>> {
        this.logger.log(ctx, `${this.getPostById.name} was called`);
        const post = await this.postService.getPostById(ctx, id);
        return {
            data: post,
            meta: {},
        };
    }

    // get all posts
    @UseGuards(JwtAuthGuard, AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('for-ghillie/:ghillieId')
    @ApiQuery({
        name: 'cursor',
        type: String,
        description: 'Paging Cursor',
        required: false,
    })
    @ApiOperation({
        summary: 'Gets all Posts for a ghillie',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse([PostListingDto]),
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY)
    async getPostsForGhillie(
        @ReqContext() ctx: RequestContext,
        @Param('ghillieId') ghillieId: string,
        @Query('take', ParseIntPipe) take: number,
        @Query('cursor') cursor?: string,
    ): Promise<{ data: Array<PostListingDto>; meta: PageInfo }> {
        this.logger.log(ctx, `${this.getPostsForGhillie.name} was called`);
        const { posts, pageInfo } = await this.postService.getPostsForGhillie(
            ctx,
            ghillieId,
            take,
            cursor
                ? {
                      id: cursor,
                  }
                : undefined,
        );
        return {
            data: posts,
            meta: pageInfo,
        };
    }

    // get all posts
    @UseGuards(JwtAuthGuard, AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('my/all')
    @ApiQuery({
        name: 'cursor',
        type: String,
        description: 'Paging Cursor',
        required: false,
    })
    @ApiOperation({
        summary: 'Gets all Posts for a the current user',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse([PostListingDto]),
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY)
    async getPostsForCurrentUser(
        @ReqContext() ctx: RequestContext,
        @Query('take', ParseIntPipe) take: number,
        @Query('cursor') cursor?: string,
    ): Promise<{ data: Array<PostListingDto>; meta: PageInfo }> {
        this.logger.log(ctx, `${this.getPostsForGhillie.name} was called`);
        const { posts, pageInfo } =
            await this.postService.getPostsForCurrentUser(ctx, take, cursor);
        return {
            data: posts,
            meta: pageInfo,
        };
    }

    // get all posts
    @UseGuards(JwtAuthGuard, AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('all')
    @ApiOperation({
        summary: 'Gets all Posts',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse([PostListingDto]),
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY)
    async getAllPosts(
        @ReqContext() ctx: RequestContext,
        @Body() criteria: PostSearchCriteria,
    ): Promise<BaseApiResponse<PostListingDto[]>> {
        this.logger.log(ctx, `${this.getAllPosts.name} was called`);
        const { posts, count } = await this.postService.getAllPosts(
            ctx,
            criteria,
        );
        return {
            data: posts,
            meta: { count },
        };
    }

    // delete post only by an admin
    @UseGuards(JwtAuthGuard, AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Delete(':id')
    @ApiOperation({
        summary: 'Deletes a Post',
    })
    @ApiResponse({
        status: HttpStatus.OK,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_ADMIN)
    async deletePost(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
    ): Promise<void> {
        this.logger.log(ctx, `${this.deletePost.name} was called`);
        await this.postService.hardDeletePost(ctx, id);
    }

    @UseGuards(JwtAuthGuard, AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Put(':id/bookmark')
    @ApiOperation({
        summary: "Adds a Post to the current user's bookmarks",
    })
    @ApiResponse({
        status: HttpStatus.OK,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_VERIFIED_MILITARY, UserAuthority.ROLE_USER)
    async bookmarkPost(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
    ): Promise<void> {
        this.logger.log(ctx, `${this.bookmarkPost.name} was called`);
        await this.bookmarkService.bookmarkPost(ctx, id);
    }

    @UseGuards(JwtAuthGuard, AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Put(':id/unbookmark')
    @ApiOperation({
        summary: "Adds a Post to the current user's bookmarks",
    })
    @ApiResponse({
        status: HttpStatus.OK,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_VERIFIED_MILITARY, UserAuthority.ROLE_USER)
    async unbookmarkPost(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
    ): Promise<void> {
        this.logger.log(ctx, `${this.unbookmarkPost.name} was called`);
        await this.bookmarkService.unbookmarkPost(ctx, id);
    }
}
