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
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  AppLogger,
  BaseApiErrorResponse,
  BaseApiResponse,
  CommentDetailDto,
  CommentIdsInputDto,
  CreateCommentDto,
  PageInfo,
  ReqContext,
  RequestContext,
  SwaggerBaseApiResponse,
  UpdateCommentDto,
} from '../../shared';
import { PostCommentService } from '../services/post-comment.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthoritiesGuard } from '../../auth/guards/authorities.guard';
import { Authorities } from '../../auth/decorators/authority.decorator';
import { UserAuthority } from '@prisma/client';

@ApiTags('Post Comments')
@Controller('post-comments')
export class PostCommentController {
  constructor(
    private readonly logger: AppLogger,
    private readonly postCommentService: PostCommentService,
  ) {
    this.logger.setContext(PostCommentController.name);
  }

  @UseGuards(JwtAuthGuard, AuthoritiesGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @ApiOperation({
    summary: 'Creates a new comment on a Post',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(CommentDetailDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.CREATED)
  @Authorities(UserAuthority.ROLE_VERIFIED_MILITARY, UserAuthority.ROLE_USER)
  async createComment(
    @ReqContext() ctx: RequestContext,
    @Body() createCommentInput: CreateCommentDto,
  ): Promise<BaseApiResponse<CommentDetailDto>> {
    this.logger.log(ctx, `${this.createComment.name} was called`);
    const comment = await this.postCommentService.createPostComment(
      ctx,
      createCommentInput,
    );
    return {
      data: comment,
      meta: {},
    };
  }

  @UseGuards(JwtAuthGuard, AuthoritiesGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id')
  @ApiOperation({
    summary: 'Updates a Post Comment',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(CommentDetailDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
  })
  @HttpCode(HttpStatus.OK)
  @Authorities(UserAuthority.ROLE_VERIFIED_MILITARY, UserAuthority.ROLE_USER)
  async updateComment(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<BaseApiResponse<CommentDetailDto>> {
    this.logger.log(ctx, `${this.updateComment.name} was called`);
    const comment = await this.postCommentService.updatePostComment(
      ctx,
      id,
      updateCommentDto,
    );
    return {
      data: comment,
      meta: {},
    };
  }

  @UseGuards(JwtAuthGuard, AuthoritiesGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete(':id')
  @ApiOperation({
    summary: 'Deletes a Post Comment',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
  })
  @HttpCode(HttpStatus.OK)
  @Authorities(UserAuthority.ROLE_ADMIN)
  async deleteComment(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<void> {
    this.logger.log(ctx, `${this.deleteComment.name} was called`);
    await this.postCommentService.deletePostComment(ctx, id);
  }

  // get all post comments
  @UseGuards(JwtAuthGuard, AuthoritiesGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('for-post/:postId')
  @ApiQuery({
    name: 'cursor',
    type: String,
    description: 'Paging Cursor',
    required: false,
  })
  @ApiOperation({
    summary: 'Gets all comments for a Post',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([CommentDetailDto]),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
  })
  @HttpCode(HttpStatus.OK)
  @Authorities(UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY)
  async getCommentsForPost(
    @ReqContext() ctx: RequestContext,
    @Param('postId') postId: string,
    @Query('take', ParseIntPipe) take: number,
    @Query('cursor') cursor?: string,
  ): Promise<{ data: Array<CommentDetailDto>; meta: PageInfo }> {
    this.logger.log(ctx, `${this.getCommentsForPost.name} was called`);
    const { comments, pageInfo } =
      await this.postCommentService.getTopLevelPostComments(
        ctx,
        postId,
        take,
        cursor,
      );
    return {
      data: comments,
      meta: pageInfo,
    };
  }

  @UseGuards(JwtAuthGuard, AuthoritiesGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('children')
  @ApiOperation({
    summary: 'Gets all child comments for a Post by ids',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([CommentDetailDto]),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
  })
  @HttpCode(HttpStatus.OK)
  @Authorities(UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY)
  async getChildComments(
    @ReqContext() ctx: RequestContext,
    @Body() children: CommentIdsInputDto,
  ): Promise<BaseApiResponse<Array<CommentDetailDto>>> {
    this.logger.log(ctx, `${this.getChildComments.name} was called`);
    const comments = await this.postCommentService.getPostCommentsChildrenByIds(
      ctx,
      children,
    );
    return {
      data: comments,
      meta: {},
    };
  }

  @UseGuards(JwtAuthGuard, AuthoritiesGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id/children/by-level')
  @ApiOperation({
    summary: 'Gets all comments for a Post by the level',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([CommentDetailDto]),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
  })
  @HttpCode(HttpStatus.OK)
  @Authorities(UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY)
  async getChildCommentsForPostByLevel(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
    @Query('level', ParseIntPipe) level: number,
  ): Promise<BaseApiResponse<Array<CommentDetailDto>>> {
    this.logger.log(
      ctx,
      `${this.getChildCommentsForPostByLevel.name} was called`,
    );
    const comments = await this.postCommentService.getAllChildrenByLevel(
      ctx,
      id,
      level,
    );
    return {
      data: comments,
      meta: {},
    };
  }
}
