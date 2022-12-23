import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    HttpCode,
    HttpException,
    HttpStatus,
    Param,
    Post,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import {
    AuthChangePasswordInputDto,
    BaseApiErrorResponse,
    BaseApiResponse,
    AuthPasswordResetInitDto,
    SwaggerBaseApiResponse,
    AuthPasswordResetFinishDto,
    AuthResendVerifyEmailInputDto,
    AuthTokenOutput,
    LoginInput,
    RefreshTokenInput,
    RegisterInput,
    RegisterOutput,
    RequestContext,
    AppLogger,
    ReqContext,
    AuthVerifyEmailInputDto,
    AuthPasswordResetVerifyKeyDto,
} from '../../shared';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly logger: AppLogger,
    ) {
        this.logger.setContext(AuthController.name);
    }

    @Post('/activate')
    @ApiOperation({
        summary: 'Activate users API',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(AuthTokenOutput),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
    })
    @HttpCode(HttpStatus.OK)
    async activate(
        @ReqContext() ctx: RequestContext,
        @Body() emailInputDto: AuthVerifyEmailInputDto,
    ): Promise<BaseApiResponse<AuthTokenOutput>> {
        this.logger.log(ctx, `${this.activate.name} was called`);

        if (
            emailInputDto.email === undefined &&
            emailInputDto.username === undefined
        ) {
            throw new HttpException(
                'Must provide either a username or email',
                HttpStatus.BAD_REQUEST,
            );
        }

        const authTokenOutput = await this.authService.activateUser(
            ctx,
            emailInputDto,
        );

        return { data: authTokenOutput, meta: {} };
    }

    // resend activation email
    @Post('/activate/resend')
    @ApiOperation({
        summary: 'Activate users resend activation email API',
    })
    @ApiResponse({
        status: HttpStatus.OK,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
    })
    @HttpCode(HttpStatus.OK)
    async resendActivationEmail(
        @ReqContext() ctx: RequestContext,
        @Body() userEmailDto: AuthResendVerifyEmailInputDto,
    ): Promise<BaseApiResponse<string>> {
        this.logger.log(ctx, `${this.resendActivationEmail.name} was called`);

        if (
            userEmailDto.email === undefined &&
            userEmailDto.username === undefined
        ) {
            throw new HttpException(
                'Must provide either a username or email',
                HttpStatus.BAD_REQUEST,
            );
        }
        await this.authService.resendActivationEmail(ctx, userEmailDto);

        return {
            data: 'Activation email sent. This code will expire in 6 hours.',
            meta: {},
        };
    }

    @Post('login')
    @ApiOperation({
        summary: 'User login API',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(AuthTokenOutput),
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        type: BaseApiErrorResponse,
    })
    @HttpCode(HttpStatus.OK)
    @UseGuards(LocalAuthGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    async login(
        @ReqContext() ctx: RequestContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Body() credential: LoginInput,
    ): Promise<BaseApiResponse<AuthTokenOutput>> {
        this.logger.log(ctx, `${this.login.name} was called`);

        const authToken = await this.authService.login(ctx);
        return { data: authToken, meta: {} };
    }

    @Post('register')
    @ApiOperation({
        summary: 'User registration API',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: SwaggerBaseApiResponse(RegisterOutput),
    })
    async registerLocal(
        @ReqContext() ctx: RequestContext,
        @Body() input: RegisterInput,
    ): Promise<BaseApiResponse<RegisterOutput>> {
        this.logger.log(ctx, `${this.registerLocal.name} was called`);
        const registeredUser = await this.authService.register(ctx, input);
        return { data: registeredUser, meta: {} };
    }

    @Post('refresh-token')
    @ApiOperation({
        summary: 'Refresh access token API',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(AuthTokenOutput),
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        type: BaseApiErrorResponse,
    })
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtRefreshGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    async refreshToken(
        @ReqContext() ctx: RequestContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Body() credential: RefreshTokenInput,
    ): Promise<BaseApiResponse<AuthTokenOutput>> {
        this.logger.log(ctx, `${this.refreshToken.name} was called`);

        const authToken = await this.authService.refreshToken(ctx);
        return { data: authToken, meta: {} };
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    @ApiOperation({
        summary: 'Change password API',
    })
    @ApiResponse({
        status: HttpStatus.OK,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        type: BaseApiErrorResponse,
    })
    async changePassword(
        @ReqContext() ctx: RequestContext,
        @Body() input: AuthChangePasswordInputDto,
    ): Promise<BaseApiResponse<string>> {
        this.logger.log(ctx, `${this.changePassword.name} was called`);

        if (!ctx.user) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }

        await this.authService.changePassword(ctx, input);

        return { data: 'Password successfully changed', meta: {} };
    }

    @Post('reset-password/resend')
    @ApiOperation({
        summary: 'Resend reset password email API',
    })
    @ApiResponse({
        status: HttpStatus.OK,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
    })
    @HttpCode(HttpStatus.OK)
    async resendResetPasswordEmail(
        @ReqContext() ctx: RequestContext,
        @Body() userEmailDto: AuthPasswordResetInitDto,
    ): Promise<BaseApiResponse<string>> {
        this.logger.log(
            ctx,
            `${this.resendResetPasswordEmail.name} was called`,
        );

        await this.authService.requestPasswordReset(ctx, userEmailDto);

        return {
            data: 'Please check your email for a password reset link, the code will expire in 15 minutes.',
            meta: {},
        };
    }

    @Post('reset-password/init')
    @ApiOperation({
        summary: 'Reset password init API',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(BaseApiResponse<string>),
    })
    @HttpCode(HttpStatus.OK)
    async resetPasswordInit(
        @ReqContext() ctx: RequestContext,
        @Body() input: AuthPasswordResetInitDto,
    ): Promise<BaseApiResponse<string>> {
        this.logger.log(ctx, `${this.resetPasswordInit.name} was called`);

        await this.authService.requestPasswordReset(ctx, input);
        return {
            data: 'Please check your email for a password reset link, the code will expire in 15 minutes',
            meta: {},
        };
    }

    @Post('reset-password/finish')
    @ApiOperation({
        summary: 'Reset password finish API',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(BaseApiResponse<string>),
    })
    @HttpCode(HttpStatus.OK)
    async resetPasswordFinish(
        @ReqContext() ctx: RequestContext,
        @Body() input: AuthPasswordResetFinishDto,
    ): Promise<BaseApiResponse<string>> {
        this.logger.log(ctx, `${this.resetPasswordFinish.name} was called`);

        await this.authService.resetPassword(ctx, input);
        return {
            data: 'Password successfully changed',
            meta: {},
        };
    }

    @Post('reset-password/verify-key')
    @ApiOperation({
        summary: 'Reset password finish API',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(BaseApiResponse<string>),
    })
    @HttpCode(HttpStatus.OK)
    async resetPasswordVerifyKey(
        @ReqContext() ctx: RequestContext,
        @Body() input: AuthPasswordResetVerifyKeyDto,
    ): Promise<BaseApiResponse<string>> {
        this.logger.log(ctx, `${this.resetPasswordVerifyKey.name} was called`);

        await this.authService.verifyPasswordResetKey(ctx, input);
        return {
            data: 'Reset Key is Valid',
            meta: {},
        };
    }

    // Check if username is available
    @Get('/check-username/:username')
    @ApiOperation({
        summary: 'Check username API',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SwaggerBaseApiResponse(BaseApiResponse<{ available: boolean }>),
    })
    async checkUsername(
        @ReqContext() ctx: RequestContext,
        @Param('username') username: string,
    ): Promise<BaseApiResponse<{ available: boolean }>> {
        this.logger.log(ctx, `${this.checkUsername.name} was called`);

        const isUsernameAvailable = await this.authService.checkUsername(
            ctx,
            username,
        );
        return {
            data: {
                available: !isUsernameAvailable,
            },
            meta: {},
        };
    }
}
