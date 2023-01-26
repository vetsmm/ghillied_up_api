import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    EnableSmsMfaDto,
    EnableTotpMfaDto,
} from './multi-factor-authentication.dto';
import { MultiFactorAuthenticationService } from './multi-factor-authentication.service';
import { UserOutput } from '../user/dtos/public/user-output.dto';
import {
    AppLogger,
    MFA_PHONE_OR_TOKEN_REQUIRED,
    ReqContext,
    RequestContext,
} from '../shared';
import { MfaMethod, UserAuthority } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthoritiesGuard } from '../auth/guards/authorities.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { Authorities } from '../auth/decorators/authority.decorator';

@ApiTags('MFA')
@Controller('multi-factor-authentication')
export class MultiFactorAuthenticationController {
    constructor(
        private multiFactorAuthenticationService: MultiFactorAuthenticationService,
        private logger: AppLogger,
    ) {}

    /** Disable MFA for a user */
    @Delete()
    @UseGuards(JwtAuthGuard, AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @Authorities(UserAuthority.ROLE_USER)
    async disable2FA(@ReqContext() ctx: RequestContext): Promise<UserOutput> {
        this.logger.debug(ctx, `${this.disable2FA.name} was called`);
        return this.multiFactorAuthenticationService.disableMfa(ctx);
    }

    /** Regenerate backup codes for a user */
    @Post('regenerate')
    @UseGuards(JwtAuthGuard, AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @Authorities(UserAuthority.ROLE_USER)
    async regenerateBackupCodes(
        @ReqContext() ctx: RequestContext,
    ): Promise<string[]> {
        this.logger.debug(ctx, `${this.regenerateBackupCodes.name} was called`);
        return this.multiFactorAuthenticationService.regenerateBackupCodes(ctx);
    }

    /** Enable TOTP-based MFA for a user */
    @Post('totp')
    @UseGuards(JwtAuthGuard, AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @Authorities(UserAuthority.ROLE_USER)
    async enableTotp(
        @ReqContext() ctx: RequestContext,
        @Body() body: EnableTotpMfaDto,
    ): Promise<string[] | { img: string }> {
        this.logger.debug(ctx, `${this.enableTotp.name} was called`);
        if (body.token)
            return this.multiFactorAuthenticationService.enableMfa(
                ctx,
                MfaMethod.TOTP,
                body.token,
            );
        return {
            img: await this.multiFactorAuthenticationService.requestTotpMfa(
                ctx.user.id,
            ),
        };
    }

    /** Enable SMS-based MFA for a user */
    @Post('sms')
    @UseGuards(JwtAuthGuard, AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @Authorities(UserAuthority.ROLE_USER)
    async enableSms(
        @ReqContext() ctx: RequestContext,
        @Body() body: EnableSmsMfaDto,
    ): Promise<string[] | { success: true }> {
        this.logger.debug(ctx, `${this.enableSms.name} was called`);
        if (body.token)
            return this.multiFactorAuthenticationService.enableMfa(
                ctx,
                'SMS',
                body.token,
            );
        if (body.phone) {
            await this.multiFactorAuthenticationService.requestSmsMfa(
                ctx,
                ctx.user.id,
                body.phone,
            );
            return { success: true };
        }
        throw new BadRequestException(MFA_PHONE_OR_TOKEN_REQUIRED);
    }

    /** Enable email-based MFA for a user */
    @Post('email')
    @UseGuards(JwtAuthGuard, AuthoritiesGuard, ActiveUserGuard)
    @ApiBearerAuth()
    @Authorities(UserAuthority.ROLE_USER)
    async enableEmail(
        @ReqContext() ctx: RequestContext,
        @Body() body: EnableTotpMfaDto,
    ): Promise<string[] | { success: true }> {
        this.logger.debug(ctx, `${this.enableEmail.name} was called`);
        if (body.token)
            return this.multiFactorAuthenticationService.enableMfa(
                ctx,
                'EMAIL',
                body.token,
            );
        await this.multiFactorAuthenticationService.requestEmailMfa(ctx);
        return { success: true };
    }
}
