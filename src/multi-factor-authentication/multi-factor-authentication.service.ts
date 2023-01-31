import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash } from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/services/auth.service';
import {
    AppLogger,
    MailService,
    MFA_ENABLED_CONFLICT,
    MFA_NOT_ENABLED,
    MFA_PHONE_REQUIRED,
    RequestContext,
    USER_NOT_FOUND,
} from '../shared';
import { TokensService } from '../shared/tokens/tokens.service';
import { UserOutput } from '../user/dtos/public/user-output.dto';
import { plainToInstance } from 'class-transformer';
import { MfaMethod } from '@prisma/client';
import { TwilioService } from '../shared/twilio/twilio.service';

@Injectable()
export class MultiFactorAuthenticationService {
    constructor(
        private logger: AppLogger,
        private prisma: PrismaService,
        private auth: AuthService,
        private configService: ConfigService,
        private emailService: MailService,
        private tokensService: TokensService,
        private twilioService: TwilioService,
    ) {}

    async requestTotpMfa(
        ctx: RequestContext,
        userId: string,
    ): Promise<{
        img: string;
        secret: string;
    }> {
        const enabled = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { twoFactorMethod: true },
        });
        if (!enabled) throw new NotFoundException(USER_NOT_FOUND);
        if (enabled.twoFactorMethod !== 'NONE')
            throw new ConflictException(MFA_ENABLED_CONFLICT);
        return this.auth.getTotpQrCode(ctx, userId);
    }

    async requestSmsMfa(ctx: RequestContext, userId: string): Promise<void> {
        const enabled = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { twoFactorMethod: true, phoneNumber: true },
        });
        if (!enabled) throw new NotFoundException(USER_NOT_FOUND);
        if (enabled.twoFactorMethod !== 'NONE')
            throw new ConflictException(MFA_ENABLED_CONFLICT);
        if (enabled.phoneNumber === null) {
            throw new BadRequestException(MFA_PHONE_REQUIRED);
        }
        const secret = this.auth.authenticator.generateSecret();
        await this.prisma.user.update({
            where: { id: userId },
            data: { twoFactorSecret: secret, phoneNumber: enabled.phoneNumber },
        });

        return this.twilioService.send(
            ctx,
            `${this.auth.getOneTimePassword(
                secret,
            )} is your Ghillied Up verification code.`,
            enabled.phoneNumber,
        );
    }

    async requestEmailMfa(ctx: RequestContext): Promise<void> {
        const user = await this.prisma.user.findUnique({
            where: { id: ctx.user.id },
            select: {
                twoFactorMethod: true,
                username: true,
                email: true,
                id: true,
            },
        });
        if (!user) throw new NotFoundException(USER_NOT_FOUND);
        if (user.twoFactorMethod !== 'NONE')
            throw new ConflictException(MFA_ENABLED_CONFLICT);
        const secret = this.auth.authenticator.generateSecret();
        await this.prisma.user.update({
            where: { id: ctx.user.id },
            data: { twoFactorSecret: secret },
        });
        return this.emailService.sendEnableEmailMfa(
            ctx,
            user.username,
            user.email,
            this.auth.getOneTimePassword(secret),
        );
    }

    async enableMfa(
        ctx: RequestContext,
        method: MfaMethod,
        token: string,
    ): Promise<string[]> {
        await this.auth.enableMfaMethod(ctx, method, token);
        return this.regenerateBackupCodes(ctx);
    }

    async disableMfa(ctx: RequestContext): Promise<UserOutput> {
        const enabled = await this.prisma.user.findUnique({
            where: { id: ctx.user.id },
            select: { twoFactorMethod: true },
        });
        if (!enabled) throw new NotFoundException(USER_NOT_FOUND);
        if (enabled.twoFactorMethod === 'NONE')
            throw new BadRequestException(MFA_NOT_ENABLED);
        const user = await this.prisma.user.update({
            where: { id: ctx.user.id },
            data: { twoFactorMethod: 'NONE', twoFactorSecret: null },
        });
        return plainToInstance(UserOutput, user, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async regenerateBackupCodes(ctx: RequestContext) {
        await this.prisma.backupCode.deleteMany({
            where: { user: { id: ctx.user.id } },
        });
        const codes: string[] = [];
        for await (const _ of [...Array(10)]) {
            const unsafeCode = await this.tokensService.generateRandomString(
                10,
            );
            codes.push(unsafeCode);
            const code = await hash(
                unsafeCode,
                this.configService.get<number>('security.saltRounds') ?? 10,
            );
            await this.prisma.backupCode.create({
                data: { user: { connect: { id: ctx.user.id } }, code },
            });
        }
        return codes;
    }
}
