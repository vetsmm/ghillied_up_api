import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass, plainToInstance } from 'class-transformer';
import { compare } from 'bcrypt';
import { UserOutput } from '../../user/dtos/public/user-output.dto';
import { UserService } from '../../user/services/user.service';
import UAParser from 'ua-parser-js';
import {
    AppLogger,
    AuthChangePasswordInputDto,
    AuthPasswordResetFinishDto,
    AuthPasswordResetInitDto,
    AuthResendVerifyEmailInputDto,
    AuthPasswordResetVerifyKeyDto,
    AuthTokenOutput,
    MailService,
    RegisterInput,
    RegisterOutput,
    RequestContext,
    UserAccessTokenClaims,
    LoginInput,
    UNVERIFIED_LOCATION,
    NO_TOKEN_PROVIDED,
    SESSION_NOT_FOUND,
    USER_NOT_FOUND,
    USER_NOT_ACTIVATED,
    USER_BANNED,
    USER_DELETED,
    USER_SUSPENDED,
    MFA_ENABLED_CONFLICT,
    INVALID_MFA_CODE,
    Authenticator,
    keyDecoder,
    keyEncoder,
    createDigest,
    createRandomBytes,
    MFA_BACKUP_CODE_USED,
    MFA_NOT_ENABLED,
} from '../../shared';
import { MfaMethod, User, UserAuthority, UserStatus } from '@prisma/client';
import { GeolocationService } from '../../shared/geolocation/geolocation.service';
import { ApprovedSubnetsService } from '../../approved-subnets/approved-subnets.service';
import { PrismaService } from '../../prisma/prisma.service';
import anonymize from 'ip-anonymize';
import {
    APPROVE_SUBNET_TOKEN,
    LOGIN_ACCESS_TOKEN,
    MULTI_FACTOR_TOKEN,
} from '../../shared/tokens/tokens.constants';
import { TokensService } from '../../shared/tokens/tokens.service';
import qrcode from 'qrcode';
import { MfaTokenPayload } from '../../multi-factor-authentication/dtos/mfa-token-payload.dto';

@Injectable()
export class AuthService {
    authenticator: Authenticator;

    constructor(
        private userService: UserService,
        private configService: ConfigService,
        private mailService: MailService,
        private geolocationService: GeolocationService,
        private approvedSubnetsService: ApprovedSubnetsService,
        private prisma: PrismaService,
        private tokenService: TokensService,
        private readonly logger: AppLogger,
    ) {
        this.logger.setContext(AuthService.name);

        this.authenticator = new Authenticator({
            window: [
                this.configService.get<number>('security.totpWindowPast') ?? 0,
                this.configService.get<number>('security.totpWindowFuture') ??
                    0,
            ],
            keyEncoder,
            keyDecoder,
            createDigest,
            createRandomBytes,
        });
    }

    /**
     * Get the two-factor authentication QR code
     * @returns Data URI string with QR code image
     */
    async getTotpQrCode(userId: string): Promise<string> {
        const secret = this.authenticator.generateSecret();
        await this.prisma.user.update({
            where: { id: userId },
            data: { twoFactorSecret: secret },
        });
        const otpauth = this.authenticator.keyuri(
            userId.toString(),
            this.configService.get<string>('meta.appName') ?? '',
            secret,
        );
        return qrcode.toDataURL(otpauth);
    }

    getOneTimePassword(secret: string): string {
        return this.authenticator.generate(secret);
    }

    async authenticateUser(
        ctx: RequestContext,
        username: string,
        pass: string,
        ip: string,
    ): Promise<UserAccessTokenClaims> {
        this.logger.log(ctx, `${this.authenticateUser.name} was called`);

        // The userService will throw Unauthorized in case of invalid username/password.
        const user: UserOutput =
            await this.userService.validateUsernamePassword(
                ctx,
                username,
                pass,
            );

        await this.validateUser(ctx, user.username);

        await this.checkLoginSubnet(ctx, user, ip);

        return user;
    }

    async validateUser(ctx: RequestContext, username: string): Promise<void> {
        this.logger.log(ctx, `${this.validateUser.name} was called`);

        const user = await this.userService.findByUsername(ctx, username);

        // Prevent disabled users from logging in.
        if (!user.activated) {
            throw new UnauthorizedException(USER_NOT_ACTIVATED);
        }

        switch (user.status) {
            case UserStatus.BANNED:
                throw new UnauthorizedException(USER_BANNED);
            case UserStatus.DELETED:
                throw new UnauthorizedException(USER_DELETED);
            case UserStatus.SUSPENDED:
                throw new UnauthorizedException(USER_SUSPENDED);
        }
    }

    async login(
        ctx: RequestContext,
        credential: LoginInput,
        ip: string,
    ): Promise<AuthTokenOutput> {
        this.logger.log(ctx, `${this.login.name} was called`);

        // An unauthorized error will bubble up if the user is not found or the password is incorrect.
        const userClaims = await this.authenticateUser(
            ctx,
            credential.username,
            credential.password,
            ip,
        );

        return this.getAuthToken(ctx, userClaims, ip);
    }

    async activateUser(
        ctx: RequestContext,
        activationCode: number,
        ip: string,
    ): Promise<AuthTokenOutput> {
        this.logger.log(ctx, `${this.activateUser.name} was called`);

        const user = await this.userService.activateUser(ctx, activationCode);
        if (!user) {
            throw new UnauthorizedException('Invalid activation code');
        }

        // generate a new token
        return this.getAuthToken(ctx, user, ip);
    }

    private async checkLoginSubnet(
        ctx: RequestContext,
        user: UserOutput,
        ip: string,
        origin?: string,
    ) {
        this.logger.debug(ctx, `${this.checkLoginSubnet.name} was called`);

        if (!user.checkLocationOnLogin) return;

        const subnet = anonymize(ip);
        const previousSubnets = await this.prisma.approvedSubnet.findMany({
            where: { user: { id: user.id } },
        });

        // Check if subnet is already approved
        let isApproved = false;
        for await (const item of previousSubnets) {
            if (!isApproved)
                if (await compare(subnet, item.subnet)) isApproved = true;
        }

        if (!isApproved) {
            const location = await this.geolocationService.getLocation(ip);
            const locationName =
                [
                    location?.city?.names?.en,
                    (location?.subdivisions ?? [])[0]?.names?.en,
                    location?.country?.names?.en,
                ]
                    .filter((i) => i)
                    .join(', ') || 'Unknown location';

            const expirationInMs = this.configService.get<number>(
                'auth.subnetVerifyExpiryInMs',
            );
            const expirationInMinutes = Math.floor(expirationInMs / 1000 / 60);
            const jwtToken = this.tokenService.signJwt(
                APPROVE_SUBNET_TOKEN,
                { id: user.id },
                `${expirationInMinutes}m`,
            );

            // Send email to user to approve subnet
            await this.mailService.sendLoginSubnetApproval(
                ctx,
                ip,
                user,
                locationName,
                jwtToken,
                expirationInMinutes,
            );

            // Throw exception to kill off the login
            throw new UnauthorizedException(UNVERIFIED_LOCATION);
        }
    }

    async logout(ctx: RequestContext, token: string): Promise<void> {
        if (!token) throw new UnprocessableEntityException(NO_TOKEN_PROVIDED);
        const session = await this.prisma.session.findFirst({
            where: { token },
            select: { id: true, user: { select: { id: true } } },
        });
        if (!session) throw new NotFoundException(SESSION_NOT_FOUND);
        await this.prisma.session.delete({
            where: { id: session.id },
        });
    }

    async register(
        ctx: RequestContext,
        input: RegisterInput,
        ip: string,
    ): Promise<RegisterOutput> {
        this.logger.log(ctx, `${this.register.name} was called`);

        if (this.configService.get('app.registrationsEnabled') === false) {
            throw new UnauthorizedException(
                'Registrations are currently disabled',
            );
        }

        input.authorities = [UserAuthority.ROLE_USER];

        const response = await this.userService.createUser(ctx, input);
        this.mailService.sendUserActivation(
            ctx,
            response.output.username,
            response.output.email,
            response.activationCode,
        );

        await this.approvedSubnetsService.approveNewSubnet(
            ctx,
            response.output.id,
            ip,
        );
        return plainToClass(RegisterOutput, response.output, {
            excludeExtraneousValues: true,
        });
    }

    async refreshToken(
        ctx: RequestContext,
        ip: string,
        token: string,
    ): Promise<AuthTokenOutput> {
        this.logger.debug(ctx, `${this.refreshToken.name} was called`);

        if (!token) throw new UnprocessableEntityException(NO_TOKEN_PROVIDED);
        const session = await this.prisma.session.findFirst({
            where: { token },
            include: { user: true },
        });

        if (!session) throw new NotFoundException(SESSION_NOT_FOUND);
        await this.prisma.session.updateMany({
            where: { token },
            data: { ipAddress: ip, userAgent: ctx.userAgent },
        });

        // async update the last login time
        this.userService.updateLastLogin(ctx, session.user.id);

        return {
            accessToken: await this.getAccessToken(session.user, session.id),
            refreshToken: token,
        };
    }

    async getAuthToken(
        ctx: RequestContext,
        user: UserAccessTokenClaims | UserOutput,
        ip: string,
    ): Promise<AuthTokenOutput> {
        this.logger.log(ctx, `${this.getAuthToken.name} was called`);

        const token = await this.tokenService.generateRandomString(64);
        const ua = new UAParser(ctx.userAgent);
        const location = await this.geolocationService.getLocation(ip);
        const { id } = await this.prisma.session.create({
            data: {
                token,
                ipAddress: ip,
                city: location?.city?.names?.en,
                region: location?.subdivisions?.pop()?.names?.en,
                timezone: location?.location?.time_zone,
                countryCode: location?.country?.iso_code,
                userAgent: ctx.userAgent,
                browser:
                    `${ua.getBrowser().name ?? ''} ${
                        ua.getBrowser().version ?? ''
                    }`.trim() || undefined,
                operatingSystem:
                    `${ua.getOS().name ?? ''} ${ua.getOS().version ?? ''}`
                        .replace('Mac OS', 'macOS')
                        .trim() || undefined,
                user: { connect: { id: user.id } },
            },
        });

        const authToken = {
            refreshToken: token,
            accessToken: await this.getAccessToken(user, id),
        };

        // async update the last login time
        this.userService.updateLastLogin(ctx, user.id);

        return plainToClass(AuthTokenOutput, authToken, {
            excludeExtraneousValues: true,
        });
    }

    private async getAccessToken(
        user: UserAccessTokenClaims | UserOutput | User,
        sessionId: string,
    ): Promise<string> {
        const payload = {
            userId: user.id,
            username: user.username,
            authorities: user.authorities,
            sessionId,
        };

        return this.tokenService.signJwt(
            LOGIN_ACCESS_TOKEN,
            { ...payload },
            this.configService.get<string>('jwt.accessTokenExpiresInSec'),
        );
    }

    changePassword(ctx: RequestContext, input: AuthChangePasswordInputDto) {
        this.logger.log(ctx, `${this.changePassword.name} was called`);

        // verify old password
        return this.userService
            .validateUsernamePassword(ctx, ctx.user.username, input.oldPassword)
            .then(() => {
                // update password
                return this.userService.changePassword(
                    ctx,
                    ctx.user.username,
                    input.newPassword,
                );
            })
            .catch((err) => {
                throw new UnauthorizedException(err);
            });
    }

    async requestPasswordReset(
        ctx: RequestContext,
        input: AuthPasswordResetInitDto,
    ) {
        this.logger.log(ctx, `${this.requestPasswordReset.name} was called`);

        this.userService
            .resetPassword(ctx, input.email)
            .then(async (user) => {
                await this.mailService.sendPasswordReset(ctx, user);
            })
            .catch((err) => {
                this.logger.warn(
                    ctx,
                    `${this.requestPasswordReset.name} failed`,
                    err,
                );
            });
    }

    async resetPassword(
        ctx: RequestContext,
        input: AuthPasswordResetFinishDto,
    ) {
        this.logger.log(ctx, `${this.resetPassword.name} was called`);

        return this.userService.resetPasswordFinish(ctx, input);
    }

    async checkUsername(
        ctx: RequestContext,
        username: string,
    ): Promise<boolean> {
        this.logger.log(ctx, `${this.checkUsername.name} was called`);

        return this.userService.usernameExists(ctx, username);
    }

    async resendActivationEmail(
        ctx: RequestContext,
        resendVerifyEmailInputDto: AuthResendVerifyEmailInputDto,
    ) {
        this.logger.log(ctx, `${this.resendActivationEmail.name} was called`);

        const user = await this.userService.generateNewActivationCode(
            ctx,
            resendVerifyEmailInputDto,
        );
        if (!user) {
            throw new UnauthorizedException('Invalid email or username');
        }

        await this.mailService.sendUserActivation(
            ctx,
            user.username,
            user.email,
            user.activationCode,
        );
    }

    async verifyPasswordResetKey(
        ctx: RequestContext,
        input: AuthPasswordResetVerifyKeyDto,
    ) {
        this.logger.log(ctx, `${this.verifyPasswordResetKey.name} was called`);

        return this.userService.verifyPasswordResetKey(ctx, input);
    }

    async approveSubnet(ctx: RequestContext, token: string, ip: string) {
        this.logger.log(ctx, `${this.approveSubnet.name} was called`);
        if (!token) throw new UnprocessableEntityException(NO_TOKEN_PROVIDED);
        const { id } = this.tokenService.verify<{ id: string }>(
            APPROVE_SUBNET_TOKEN,
            token,
        );
        const user = await this.prisma.user.findUnique({ where: { id: id } });
        if (!user) throw new NotFoundException(USER_NOT_FOUND);
        await this.approvedSubnetsService.approveNewSubnet(ctx, id, ip);
        return this.getAuthToken(ctx, user, ip);
    }

    async enableMfaMethod(
        ctx: RequestContext,
        method: MfaMethod,
        code: string,
    ): Promise<UserOutput> {
        const user = await this.prisma.user.findUnique({
            where: { id: ctx.user.id },
            select: { twoFactorSecret: true, twoFactorMethod: true },
        });
        if (!user) throw new NotFoundException(USER_NOT_FOUND);
        if (user.twoFactorMethod !== 'NONE')
            throw new ConflictException(MFA_ENABLED_CONFLICT);
        if (!user.twoFactorSecret)
            user.twoFactorSecret = this.authenticator.generateSecret();
        if (!this.authenticator.check(code, user.twoFactorSecret))
            throw new UnauthorizedException(INVALID_MFA_CODE);
        const result = await this.prisma.user.update({
            where: { id: ctx.user.id },
            data: {
                twoFactorMethod: method,
                twoFactorSecret: user.twoFactorSecret,
            },
        });
        return plainToInstance(UserOutput, result, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    loginWithTotp(
        ctx: RequestContext,
        ip: string,
        token: string,
        code: string,
        origin?: string,
    ) {
        const { id } = this.tokenService.verify<MfaTokenPayload>(
            MULTI_FACTOR_TOKEN,
            token,
        );

        return this.loginUserWithTotpCode(ctx, ip, id, code, origin);
    }

    private async loginUserWithTotpCode(
        ctx: RequestContext,
        ipAddress: string,
        id: string,
        code: string,
        origin?: string,
    ): Promise<AuthTokenOutput> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) throw new NotFoundException(USER_NOT_FOUND);

        if (user.twoFactorMethod === 'NONE' || !user.twoFactorSecret)
            throw new BadRequestException(MFA_NOT_ENABLED);

        if (this.authenticator.check(code, user.twoFactorSecret))
            return this.getAuthToken(ctx, user, ipAddress);

        const backupCodes = await this.prisma.backupCode.findMany({
            where: { user: { id } },
        });

        let usedBackupCode = false;
        for await (const backupCode of backupCodes) {
            if (await compare(code, backupCode.code)) {
                if (!usedBackupCode) {
                    if (backupCode.isUsed)
                        throw new UnauthorizedException(MFA_BACKUP_CODE_USED);
                    usedBackupCode = true;
                    await this.prisma.backupCode.update({
                        where: { id: backupCode.id },
                        data: { isUsed: true },
                    });
                    const location = await this.geolocationService.getLocation(
                        ipAddress,
                    );
                    const locationName =
                        [
                            location?.city?.names?.en,
                            (location?.subdivisions ?? [])[0]?.names?.en,
                            location?.country?.names?.en,
                        ]
                            .filter((i) => i)
                            .join(', ') || 'Unknown location';
                    this.mailService.sendUsedBackupCode(
                        ctx,
                        user,
                        ipAddress,
                        locationName,
                    );
                }
            }
        }

        if (!usedBackupCode) throw new UnauthorizedException(INVALID_MFA_CODE);

        return this.getAuthToken(ctx, user, ipAddress);
    }
}
