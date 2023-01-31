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
    HttpException,
    HttpStatus,
    Post,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    AppLogger,
    BaseApiErrorResponse,
    ReqContext,
    RequestContext,
    FlagCommentInputDto,
} from '../../shared';
import { AuthoritiesGuard } from '../../auth/guards/authorities.guard';
import { Authorities } from '../../auth/decorators/authority.decorator';
import { UserAuthority } from '@prisma/client';
import { FlagCommentService } from '../services/flag-comment.service';
import { ActiveUserGuard } from '../../auth/guards/active-user.guard';

@ApiTags('Flag Comments')
@Controller('flags/comment')
export class FlagCommentController {
    constructor(
        private readonly logger: AppLogger,
        private readonly flagCommentService: FlagCommentService,
    ) {
        this.logger.setContext(FlagCommentController.name);
    }

    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Post()
    @ApiOperation({
        summary: 'Creates a new flag for a comment',
    })
    @ApiResponse({
        status: HttpStatus.OK,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        type: BaseApiErrorResponse,
    })
    @HttpCode(HttpStatus.CREATED)
    @Authorities(UserAuthority.ROLE_USER, UserAuthority.ROLE_VERIFIED_MILITARY)
    async flagComment(
        @ReqContext() ctx: RequestContext,
        @Body() input: FlagCommentInputDto,
    ): Promise<void> {
        this.logger.log(ctx, `${this.flagComment.name} was called`);

        try {
            await this.flagCommentService.flagComment(ctx, input);
        } catch (err) {
            throw new HttpException(err, HttpStatus.BAD_REQUEST);
        }
    }
}
