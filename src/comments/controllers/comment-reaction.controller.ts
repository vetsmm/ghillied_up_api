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
    CommentReactionInputDto,
    CommentReactionSubsetDto,
    ReqContext,
    RequestContext,
    SwaggerBaseApiResponse,
} from '../../shared';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthoritiesGuard } from '../../auth/guards/authorities.guard';
import { Authorities } from '../../auth/decorators/authority.decorator';
import { UserAuthority } from '@prisma/client';
import { CommentReactionService } from '../services/comment-reaction.service';

@ApiTags('comment-reactions')
@Controller('comment-reactions')
export class CommentReactionController {
    constructor(
        private readonly logger: AppLogger,
        private readonly commentReactionService: CommentReactionService,
    ) {
        this.logger.setContext(CommentReactionController.name);
    }

    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('/parent')
    @ApiOperation({
        summary: 'Creates a new comment reaction',
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
    async reactToParentComment(
        @ReqContext() ctx: RequestContext,
        @Body() commentReactionDto: CommentReactionInputDto,
    ) {
        this.logger.log(ctx, `${this.reactToParentComment.name} was called`);
        await this.commentReactionService.reactToComment(
            ctx,
            commentReactionDto,
        );
    }

    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('/child')
    @ApiOperation({
        summary: 'Creates a new comment reaction for a child comment',
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
    async reactToChildComment(
        @ReqContext() ctx: RequestContext,
        @Body() commentReactionDto: CommentReactionInputDto,
    ) {
        this.logger.log(ctx, `${this.reactToChildComment.name} was called`);
        await this.commentReactionService.reactToComment(
            ctx,
            commentReactionDto,
        );
    }

    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Get(':commentId/reactions')
    @ApiOperation({
        summary: 'Gets all reactions for a Comment by a Comment by id',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(CommentReactionSubsetDto),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY)
    async getPostReactionsCount(
        @ReqContext() ctx: RequestContext,
        @Param('commentId') commentId: string,
    ): Promise<BaseApiResponse<CommentReactionSubsetDto>> {
        this.logger.log(ctx, `${this.getPostReactionsCount.name} was called`);
        const reactions =
            await this.commentReactionService.getCommentReactionsCount(
                ctx,
                commentId,
            );
        return {
            data: reactions,
            meta: {},
        };
    }
}
