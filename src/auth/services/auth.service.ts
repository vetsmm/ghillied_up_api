import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { plainToClass } from 'class-transformer';

import { UserOutput } from '../../user/dtos/public/user-output.dto';
import { UserService } from '../../user/services/user.service';
import {
  AppLogger,
  AuthChangePasswordInputDto,
  AuthPasswordResetFinishDto,
  AuthPasswordResetInitDto,
  AuthResendVerifyEmailInputDto,
  AuthPasswordResetVerifyKeyDto,
  AuthTokenOutput,
  AuthVerifyEmailInputDto,
  MailService,
  RegisterInput,
  RegisterOutput,
  RequestContext,
  UserAccessTokenClaims,
} from '../../shared';
import { UserAuthority } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async validateUser(
    ctx: RequestContext,
    username: string,
    pass: string,
  ): Promise<UserAccessTokenClaims> {
    this.logger.log(ctx, `${this.validateUser.name} was called`);

    // The userService will throw Unauthorized in case of invalid username/password.
    const user = await this.userService.validateUsernamePassword(
      ctx,
      username,
      pass,
    );

    // Prevent disabled users from logging in.
    if (!user.activated) {
      throw new UnauthorizedException('This users account is not activated');
    }

    return user;
  }

  async login(ctx: RequestContext): Promise<AuthTokenOutput> {
    this.logger.log(ctx, `${this.login.name} was called`);

    return this.getAuthToken(ctx, ctx.user);
  }

  async activateUser(
    ctx: RequestContext,
    activationDto: AuthVerifyEmailInputDto,
  ): Promise<AuthTokenOutput> {
    this.logger.log(ctx, `${this.activateUser.name} was called`);

    const user = await this.userService.activateUser(ctx, activationDto);
    if (!user) {
      throw new UnauthorizedException('Invalid activation code');
    }

    // generate a new token
    return this.getAuthToken(ctx, user);
  }

  async register(
    ctx: RequestContext,
    input: RegisterInput,
  ): Promise<RegisterOutput> {
    this.logger.log(ctx, `${this.register.name} was called`);

    if (this.configService.get('app.registrationsEnabled') === false) {
      throw new UnauthorizedException('Registrations are currently disabled');
    }

    // TODO : Setting default role as USER here.
    //  Will add option to change this later via ADMIN users.
    input.authorities = [UserAuthority.ROLE_USER];

    const response = await this.userService.createUser(ctx, input);
    this.mailService.sendUserActivation(
      ctx,
      response.output.username,
      response.output.email,
      response.activationCode,
    );
    return plainToClass(RegisterOutput, response.output, {
      excludeExtraneousValues: true,
    });
  }

  async refreshToken(ctx: RequestContext): Promise<AuthTokenOutput> {
    this.logger.log(ctx, `${this.refreshToken.name} was called`);

    const user = await this.userService.findById(ctx, ctx.user.id);
    if (!user) {
      throw new UnauthorizedException('Invalid users id');
    }

    return this.getAuthToken(ctx, user);
  }

  async getAuthToken(
    ctx: RequestContext,
    user: UserAccessTokenClaims | UserOutput,
  ): Promise<AuthTokenOutput> {
    this.logger.log(ctx, `${this.getAuthToken.name} was called`);

    const subject = { sub: user.id };
    const payload = {
      username: user.username,
      sub: user.id,
      authorities: user.authorities,
    };

    const authToken = {
      refreshToken: this.jwtService.sign(subject, {
        expiresIn: this.configService.get('jwt.refreshTokenExpiresInSec'),
      }),
      accessToken: this.jwtService.sign(
        { ...payload, ...subject },
        { expiresIn: this.configService.get('jwt.accessTokenExpiresInSec') },
      ),
    };

    // asyncronously update the last login time
    this.userService.updateLastLogin(ctx, user.id);

    return plainToClass(AuthTokenOutput, authToken, {
      excludeExtraneousValues: true,
    });
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
        this.logger.warn(ctx, `${this.requestPasswordReset.name} failed`, err);
      });
  }

  async resetPassword(ctx: RequestContext, input: AuthPasswordResetFinishDto) {
    this.logger.log(ctx, `${this.resetPassword.name} was called`);

    return this.userService.resetPasswordFinish(ctx, input);
  }

  async checkUsername(ctx: RequestContext, username: string): Promise<boolean> {
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
}
