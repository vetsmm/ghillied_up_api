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
  FlagPostInputDto,
} from '../../shared';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthoritiesGuard } from '../../auth/guards/authorities.guard';
import { Authorities } from '../../auth/decorators/authority.decorator';
import { UserAuthority } from '@prisma/client';
import { FlagPostService } from '../services/flag-post.service';
import { ActiveUserGuard } from '../../auth/guards/active-user.guard';

@ApiTags('Flag Post')
@Controller('flags/post')
export class FlagPostController {
  constructor(
    private readonly logger: AppLogger,
    private readonly flagPostService: FlagPostService,
  ) {
    this.logger.setContext(FlagPostController.name);
  }

  @UseGuards(JwtAuthGuard, AuthoritiesGuard, ActiveUserGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @ApiOperation({
    summary: 'Creates a new flag for a post',
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
  async flagPost(
    @ReqContext() ctx: RequestContext,
    @Body() input: FlagPostInputDto,
  ): Promise<void> {
    this.logger.log(ctx, `${this.flagPost.name} was called`);

    try {
      await this.flagPostService.flagPost(ctx, input);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }
}
