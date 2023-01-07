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
  HttpStatus,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../services/user.service';

import { Authorities } from '../../auth/decorators/authority.decorator';
import { UserAuthority } from '@prisma/client';
import { UserOutputAnonymousDto } from '../dtos/anonymous/user-output-anonymous.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthoritiesGuard } from '../../auth/guards/authorities.guard';
import {
  AppLogger,
  BaseApiErrorResponse,
  BaseApiResponse,
  PaginationParamsDto,
  ReqContext,
  RequestContext,
  SwaggerBaseApiResponse,
} from '../../shared';

@ApiTags('Users Anonymous')
@Controller('users-anon')
export class AnonymousUserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AnonymousUserController.name);
  }

  @UseGuards(JwtAuthGuard, AuthoritiesGuard)
  @ApiBearerAuth()
  @Authorities(UserAuthority.ROLE_ADMIN, UserAuthority.ROLE_USER)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':slug')
  @ApiOperation({
    summary: 'Get users by slug API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(UserOutputAnonymousDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async getUser(
    @ReqContext() ctx: RequestContext,
    @Param('slug') id: string,
  ): Promise<BaseApiResponse<UserOutputAnonymousDto>> {
    this.logger.log(ctx, `${this.getUser.name} was called`);

    const user = await this.userService.getUserBySlug(ctx, id);
    return { data: user, meta: {} };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({
    summary: 'Get users with anon info as a list API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([UserOutputAnonymousDto]),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  @UseGuards(JwtAuthGuard, AuthoritiesGuard)
  @Authorities(UserAuthority.ROLE_ADMIN, UserAuthority.ROLE_USER)
  async getUsers(
    @ReqContext() ctx: RequestContext,
    @Query() query: PaginationParamsDto,
  ): Promise<BaseApiResponse<UserOutputAnonymousDto[]>> {
    this.logger.log(ctx, `${this.getUsers.name} was called`);

    const { users, count } = await this.userService.getUsersAnon(
      ctx,
      query.limit,
      query.offset,
    );

    return { data: users, meta: { count } };
  }
}
