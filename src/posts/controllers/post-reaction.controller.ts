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
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  AppLogger,
  BaseApiErrorResponse,
  BaseApiResponse,
  PostReactionInputDto,
  PostReactionSubsetDto,
  ReqContext,
  RequestContext,
  SwaggerBaseApiResponse,
} from '../../shared';
import { PostReactionService } from '../services/post-reaction.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthoritiesGuard } from '../../auth/guards/authorities.guard';
import { Authorities } from '../../auth/decorators/authority.decorator';
import { UserAuthority } from '@prisma/client';
import { ActiveUserGuard } from '../../auth/guards/active-user.guard';

@ApiTags('post-reactions')
@Controller('post-reactions')
export class PostReactionController {
  constructor(
    private readonly logger: AppLogger,
    private readonly postReactionService: PostReactionService,
  ) {
    this.logger.setContext(PostReactionController.name);
  }

  @UseGuards(JwtAuthGuard, AuthoritiesGuard, ActiveUserGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @ApiOperation({
    summary: 'Creates a new post reaction',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.OK)
  @Authorities(UserAuthority.ROLE_VERIFIED_MILITARY, UserAuthority.ROLE_USER)
  async reactToPost(
    @ReqContext() ctx: RequestContext,
    @Body() postReactionDto: PostReactionInputDto,
  ) {
    this.logger.log(ctx, `${this.reactToPost.name} was called`);
    await this.postReactionService.reactToPost(ctx, postReactionDto);
  }

  @UseGuards(JwtAuthGuard, AuthoritiesGuard, ActiveUserGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':postId/reactions')
  @ApiOperation({
    summary: 'Gets all reactions for a Post by a Post by id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(PostReactionSubsetDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
  })
  @HttpCode(HttpStatus.OK)
  @Authorities(UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY)
  async getPostReactionsCount(
    @ReqContext() ctx: RequestContext,
    @Param('postId') postId: string,
  ): Promise<BaseApiResponse<PostReactionSubsetDto>> {
    this.logger.log(ctx, `${this.getPostReactionsCount.name} was called`);
    const reactions = await this.postReactionService.getPostReactionsCount(
      ctx,
      postId,
    );
    return {
      data: reactions,
      meta: {},
    };
  }
}
