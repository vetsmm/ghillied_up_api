import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    HttpStatus,
    Param,
    Patch,
    Query,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { Authorities } from '../../auth/decorators/authority.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthoritiesGuard } from '../../auth/guards/authorities.guard';

import { UserOutput } from '../dtos/public/user-output.dto';
import { UpdateUserInput } from '../dtos/public/user-update-input.dto';
import { UserService } from '../services/user.service';
import {
    BaseApiErrorResponse,
    BaseApiResponse,
    PaginationParamsDto,
    RequestContext,
    SwaggerBaseApiResponse,
    AppLogger,
    ReqContext,
} from '../../shared';
import { UserAuthority } from '@prisma/client';

@ApiTags('users')
@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly logger: AppLogger,
    ) {
        this.logger.setContext(UserController.name);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('me')
    @ApiOperation({
        summary: 'Get users me API',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(UserOutput),
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        type: BaseApiErrorResponse,
    })
    async getMyProfile(
        @ReqContext() ctx: RequestContext,
    ): Promise<BaseApiResponse<UserOutput>> {
        this.logger.log(ctx, `${this.getMyProfile.name} was called`);

        const user = await this.userService.findById(ctx, ctx.user.id);
        return { data: user, meta: {} };
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Get()
    @ApiOperation({
        summary: 'Get users as a list API',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse([UserOutput]),
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        type: BaseApiErrorResponse,
    })
    @UseGuards(JwtAuthGuard, AuthoritiesGuard)
    @Authorities(UserAuthority.ROLE_ADMIN)
    async getUsers(
        @ReqContext() ctx: RequestContext,
        @Query() query: PaginationParamsDto,
    ): Promise<BaseApiResponse<UserOutput[]>> {
        this.logger.log(ctx, `${this.getUsers.name} was called`);

        const { users, count } = await this.userService.getUsers(
            ctx,
            query.limit,
            query.offset,
        );

        return { data: users, meta: { count } };
    }

    @Authorities(UserAuthority.ROLE_ADMIN)
    @UseInterceptors(ClassSerializerInterceptor)
    @Get(':id')
    @ApiOperation({
        summary: 'Get users by id API',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(UserOutput),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        type: BaseApiErrorResponse,
    })
    async getUser(
        @ReqContext() ctx: RequestContext,
        @Param('id') id: string,
    ): Promise<BaseApiResponse<UserOutput>> {
        this.logger.log(ctx, `${this.getUser.name} was called`);

        const user = await this.userService.getUserById(ctx, id);
        return { data: user, meta: {} };
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Patch('self')
    @ApiOperation({
        summary: 'Update self users API',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(UserOutput),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        type: BaseApiErrorResponse,
    })
    @UseInterceptors(ClassSerializerInterceptor)
    @Authorities(UserAuthority.ROLE_USER)
    async updateUserSelf(
        @ReqContext() ctx: RequestContext,
        @Body() input: UpdateUserInput,
    ): Promise<BaseApiResponse<UserOutput>> {
        this.logger.log(ctx, `${this.updateUserSelf.name} was called`);

        const user = await this.userService.updateUser(ctx, ctx.user.id, input);
        return { data: user, meta: {} };
    }
}
