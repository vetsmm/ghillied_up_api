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
    Query,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    AppLogger,
    CommentDetailDto,
    CreateCommentDto,
    ReqContext,
    RequestContext,
    UpdateCommentDto,
} from '../../shared';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthoritiesGuard } from '../../auth/guards/authorities.guard';
import { Authorities } from '../../auth/decorators/authority.decorator';
import { UserAuthority } from '@prisma/client';
import { ParentCommentService } from '../services/parent-comment.service';
import { ParentCommentDto } from '../dtos/parent-comment.dto';

@ApiTags('Parent Comments')
@Controller('parent-comments')
export class ParentCommentController {
    constructor(
        private readonly logger: AppLogger,
        private readonly parentCommentService: ParentCommentService,
    ) {
        this.logger.setContext(ParentCommentController.name);
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
        type: CommentDetailDto,
    })
    @HttpCode(HttpStatus.CREATED)
    @Authorities(UserAuthority.ROLE_VERIFIED_MILITARY, UserAuthority.ROLE_USER)
    async createComment(
        @ReqContext() ctx: RequestContext,
        @Body() createCommentInput: CreateCommentDto,
    ): Promise<CommentDetailDto> {
        this.logger.log(ctx, `${this.createComment.name} was called`);
        return await this.parentCommentService.createPostComment(
            ctx,
            createCommentInput,
        );
    }

    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Patch(':id')
    @ApiOperation({
        summary: 'Updates a Parent Comment',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: CommentDetailDto,
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_VERIFIED_MILITARY, UserAuthority.ROLE_USER)
    async updateComment(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
        @Body() updateCommentDto: UpdateCommentDto,
    ): Promise<CommentDetailDto> {
        this.logger.log(ctx, `${this.updateComment.name} was called`);
        return await this.parentCommentService.updatePostComment(
            ctx,
            id,
            updateCommentDto,
        );
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
        await this.parentCommentService.deletePostComment(ctx, id);
    }

    // get all post comments
    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('feed/:postId')
    @ApiOperation({
        summary: 'Gets all comments for a Post via GetStream Feed',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: [ParentCommentDto],
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY)
    async getParentCommentFeed(
        @ReqContext() ctx: RequestContext,
        @Param('postId') postId: string,
        @Query('limit') limit: number,
        @Query('page') page?: number,
    ): Promise<ParentCommentDto[]> {
        this.logger.log(ctx, `${this.getParentCommentFeed.name} was called`);
        return await this.parentCommentService.getParentCommentFeed(
            ctx,
            postId,
            limit,
            page,
        );
    }
}
