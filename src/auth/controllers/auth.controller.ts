import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    HttpCode,
    HttpException,
    HttpStatus,
    Ip,
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
    AuthVerifyCodeInputDto,
    RateLimit,
} from '../../shared';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TotpLoginDto } from '../dtos/totp-login.dto';
import { TotpTokenResponse } from '../../multi-factor-authentication/dtos/totp-token-response.dto';

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
    @HttpCode(HttpStatus.OK)
    async activate(
        @ReqContext() ctx: RequestContext,
        @Ip() ip: string,
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
            emailInputDto.activationCode,
            ip,
        );

        return { data: authTokenOutput, meta: {} };
    }

    @Post('/activate/code')
    @HttpCode(HttpStatus.OK)
    async activateWithCodeOnly(
        @ReqContext() ctx: RequestContext,
        @Ip() ip: string,
        @Body() codeInput: AuthVerifyCodeInputDto,
    ): Promise<AuthTokenOutput> {
        this.logger.log(ctx, `${this.activate.name} was called`);

        return await this.authService.activateUser(
            ctx,
            codeInput.activationCode,
            ip,
        );
    }

    // resend activation email
    @Post('/activate/resend')
    @ApiOperation({
        summary: 'Activate users resend activation email API',
    })
    @RateLimit(10)
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
    @RateLimit(10)
    @ApiOperation({
        summary: 'User login API',
    })
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ClassSerializerInterceptor)
    async login(
        @ReqContext() ctx: RequestContext,
        @Ip() ip: string,
        @Body() credential: LoginInput,
    ): Promise<AuthTokenOutput | TotpTokenResponse> {
        this.logger.log(ctx, `${this.login.name} was called`);

        return await this.authService.login(ctx, credential, ip);
    }

    @Post('register')
    @RateLimit(10)
    @ApiOperation({
        summary: 'User registration API',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: SwaggerBaseApiResponse(RegisterOutput),
    })
    async registerLocal(
        @ReqContext() ctx: RequestContext,
        @Ip() ip: string,
        @Body() input: RegisterInput,
    ): Promise<BaseApiResponse<RegisterOutput>> {
        this.logger.log(ctx, `${this.registerLocal.name} was called`);
        const registeredUser = await this.authService.register(ctx, input, ip);
        return { data: registeredUser, meta: {} };
    }

    @Post('approve-subnet')
    @RateLimit(5)
    async approveSubnet(
        @ReqContext() ctx: RequestContext,
        @Ip() ip: string,
        @Body('token') token: string,
    ): Promise<AuthTokenOutput> {
        this.logger.log(ctx, `${this.approveSubnet.name} was called`);
        return await this.authService.approveSubnet(ctx, token, ip);
    }

    @Post('refresh-token')
    @RateLimit(10)
    @ApiOperation({
        summary: 'Refresh access token API',
    })
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ClassSerializerInterceptor)
    async refreshToken(
        @ReqContext() ctx: RequestContext,
        @Ip() ip: string,
        @Body() credential: RefreshTokenInput,
    ): Promise<AuthTokenOutput> {
        this.logger.log(ctx, `${this.refreshToken.name} was called`);

        return await this.authService.refreshToken(
            ctx,
            ip,
            credential.refreshToken,
        );
    }

    /** Logout from a session */
    @Post('logout')
    @RateLimit(5)
    async logout(
        @ReqContext() ctx: RequestContext,
        @Body('token') refreshToken: string,
    ): Promise<{ success: true }> {
        this.logger.log(ctx, `${this.logout.name} was called`);
        await this.authService.logout(ctx, refreshToken);
        return { success: true };
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    @RateLimit(10)
    @ApiOperation({
        summary: 'Change password API',
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
    @RateLimit(10)
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
    @RateLimit(10)
    @ApiOperation({
        summary: 'Reset password init API',
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
    @RateLimit(10)
    @ApiOperation({
        summary: 'Reset password finish API',
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
    @RateLimit(10)
    @ApiOperation({
        summary: 'Reset password finish API',
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

    /** Login using TOTP */
    @Post('login/totp')
    @RateLimit(10)
    async totpLogin(
        @ReqContext() ctx: RequestContext,
        @Body() data: TotpLoginDto,
        @Ip() ip: string,
        @Body('origin') origin?: string,
    ): Promise<AuthTokenOutput> {
        return await this.authService.loginWithTotp(
            ctx,
            ip,
            data.token,
            data.code,
            origin,
        );
    }

    @Post('login/token')
    @RateLimit(10)
    async emailTokenLoginPost(
        @ReqContext() ctx: RequestContext,
        @Body('token') token: string,
        @Ip() ip: string,
    ): Promise<AuthTokenOutput> {
        return await this.authService.loginWithEmailToken(ctx, ip, token);
    }
}
