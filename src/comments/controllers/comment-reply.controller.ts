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
    ReqContext,
    RequestContext,
    UpdateCommentDto,
} from '../../shared';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthoritiesGuard } from '../../auth/guards/authorities.guard';
import { Authorities } from '../../auth/decorators/authority.decorator';
import { UserAuthority } from '@prisma/client';
import { ParentCommentDto } from '../dtos/parent-comment.dto';
import { CommentReplyService } from '../services/comment-reply.service';
import { ChildCommentDto } from '../dtos/child-comment.dto';
import { CreateCommentReplyDto } from '../dtos/create-comment-reply.dto';

@ApiTags('Comment Replies')
@Controller('comment-replies')
export class CommentReplyController {
    constructor(
        private readonly logger: AppLogger,
        private readonly commentReplyService: CommentReplyService,
    ) {
        this.logger.setContext(CommentReplyController.name);
    }

    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Post(':parentCommentId')
    @ApiOperation({
        summary: 'Creates a new comment reply',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: ChildCommentDto,
    })
    @HttpCode(HttpStatus.CREATED)
    @Authorities(UserAuthority.ROLE_VERIFIED_MILITARY, UserAuthority.ROLE_USER)
    async createComment(
        @ReqContext() ctx: RequestContext,
        @Param('parentCommentId') parentCommentId: string,
        @Body() createCommentReplyInput: CreateCommentReplyDto,
    ): Promise<ChildCommentDto> {
        this.logger.log(ctx, `${this.createComment.name} was called`);
        return await this.commentReplyService.createCommentReply(
            ctx,
            parentCommentId,
            createCommentReplyInput,
        );
    }

    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Patch(':id')
    @ApiOperation({
        summary: 'Updates a Child Comment',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: ChildCommentDto,
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_VERIFIED_MILITARY, UserAuthority.ROLE_USER)
    async updateComment(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
        @Body() updateCommentDto: UpdateCommentDto,
    ): Promise<ChildCommentDto> {
        this.logger.log(ctx, `${this.updateComment.name} was called`);
        return await this.commentReplyService.updatePostComment(
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
        summary: 'Deletes a Comment Reply',
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
        await this.commentReplyService.deletePostComment(ctx, id);
    }

    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('feed/:parentCommentId')
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
        @Param('parentCommentId') parentCommentId: string,
        @Query('limit') limit: number,
        @Query('page') page?: number,
    ): Promise<ChildCommentDto[]> {
        this.logger.log(ctx, `${this.getParentCommentFeed.name} was called`);
        return await this.commentReplyService.getChildCommentFeed(
            ctx,
            parentCommentId,
            limit,
            page,
        );
    }
}
