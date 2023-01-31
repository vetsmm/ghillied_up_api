import {
    BadRequestException,
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
    Put,
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
    RateLimit,
    USER_INVALID_PHONE_VERIFICATION_CODE,
    USER_PHONE_NUMBER_ALREADY_CONFIRMED,
} from '../../shared';
import { User, UserAuthority } from '@prisma/client';
import { ActiveUserGuard } from '../../auth/guards/active-user.guard';
import { TwilioService } from '../../shared/twilio/twilio.service';
import { CheckVerificationCodeDto } from '../dtos/check-verification-code.dto';
import { UpdatePhoneNumberDto } from '../dtos/update-phone-number.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly logger: AppLogger,
        private readonly twilioService: TwilioService,
    ) {
        this.logger.setContext(UserController.name);
    }

    @UseGuards(ActiveUserGuard)
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
    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
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

    @UseGuards(ActiveUserGuard)
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

    @UseGuards(ActiveUserGuard)
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

    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('deactivate')
    @ApiOperation({
        summary: 'initiates an account purge',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        type: BaseApiErrorResponse,
    })
    @HttpCode(HttpStatus.OK)
    @Authorities(UserAuthority.ROLE_USER)
    async deactivateUserSelf(@ReqContext() ctx: RequestContext): Promise<void> {
        this.logger.log(
            ctx,
            `An account purge was initiated for USER=${ctx.user.id}`,
        );

        await this.userService.deactivateUser(ctx, ctx.user.id);
    }

    @Put('change-phone-number')
    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Authorities(UserAuthority.ROLE_USER)
    @RateLimit(10)
    async changePhoneNumber(
        @ReqContext() ctx: RequestContext,
        @Body() updatePhoneNumberDto: UpdatePhoneNumberDto,
    ) {
        this.logger.log(ctx, `${this.changePhoneNumber.name} was called`);

        const user = await this.userService.updatedPhoneNumber(
            ctx,
            ctx.user.id,
            updatePhoneNumberDto.phoneNumber,
        );

        await this.twilioService.initiatePhoneNumberVerification(
            ctx,
            user.phoneNumber,
        );
    }

    @Post('resend-verification-code')
    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Authorities(UserAuthority.ROLE_USER)
    @RateLimit(10)
    async resendVerificationCode(@ReqContext() ctx: RequestContext) {
        this.logger.log(ctx, `${this.resendVerificationCode.name} was called`);

        const user = await this.userService.getUserById(ctx, ctx.user.id);
        this.phoneNumberConfirmed(user);

        await this.twilioService.initiatePhoneNumberVerification(
            ctx,
            user.phoneNumber,
        );
    }

    @Delete('phone-number')
    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Authorities(UserAuthority.ROLE_USER)
    @RateLimit(10)
    async deletePhoneNumber(
        @ReqContext() ctx: RequestContext,
    ): Promise<UserOutput> {
        this.logger.log(ctx, `${this.deletePhoneNumber.name} was called`);

        return await this.userService.deletePhoneNumber(ctx, ctx.user.id);
    }

    @Post('check-verification-code')
    @UseGuards(AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @UseInterceptors(ClassSerializerInterceptor)
    @Authorities(UserAuthority.ROLE_USER)
    @RateLimit(20)
    async checkVerificationCode(
        @ReqContext() ctx: RequestContext,
        @Body() verificationData: CheckVerificationCodeDto,
    ) {
        this.logger.log(ctx, `${this.checkVerificationCode.name} was called`);

        const user = await this.userService.getUserById(ctx, ctx.user.id);
        this.phoneNumberConfirmed(user);

        const result = await this.twilioService.confirmPhoneNumber(
            ctx,
            user.phoneNumber,
            verificationData.code,
        );

        if (!result.valid || result.status !== 'approved') {
            throw new BadRequestException(USER_INVALID_PHONE_VERIFICATION_CODE);
        }

        await this.userService.markPhoneNumberAsConfirmed(ctx, user.id);
    }

    private phoneNumberConfirmed(user: UserOutput | User): boolean {
        if (user.phoneNumberConfirmed) {
            throw new BadRequestException(USER_PHONE_NUMBER_ALREADY_CONFIRMED);
        }

        return user.phoneNumberConfirmed;
    }
}
