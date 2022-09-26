import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';

import { CreateUserInput } from '../dtos/public/user-create-input.dto';
import { UserOutput } from '../dtos/public/user-output.dto';
import { UpdateUserInput } from '../dtos/public/user-update-input.dto';
import {
  AppLogger,
  AuthPasswordResetFinishDto,
  AuthPasswordResetVerifyKeyDto,
  AuthResendVerifyEmailInputDto,
  AuthVerifyEmailInputDto,
  RequestContext,
} from '../../shared';
import { PrismaService } from '../../prisma/prisma.service';
import slugify from 'slugify';
import { plainToInstance } from 'class-transformer';
import { UserOutputAnonymousDto } from '../dtos/anonymous/user-output-anonymous.dto';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(UserService.name);
  }

  async createUser(
    ctx: RequestContext,
    input: CreateUserInput,
  ): Promise<{ output: UserOutput; activationCode: number }> {
    this.logger.log(ctx, `${this.createUser.name} was called`);

    this.logger.log(ctx, `Saving User ${input.username}`);

    const user = await this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          username: input.username,
          password: await hash(input.password, 10),
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          serviceStatus: input.serviceStatus,
          branch: input.branch,
          serviceEntryDate: input.serviceEntryDate,
          serviceExitDate: input.serviceExitDate,
          slug: slugify(input.username, {
            replacement: '-',
            lower: false,
            strict: true,
            trim: true,
          }),
          activationCode: await this.generateCode(),
          activationCodeSentAt: new Date(),
        },
      });

      await prisma.pushNotificationSettings.create({
        data: {
          user: {
            connect: {
              id: user.id,
            },
          },
          createdDate: new Date(),
          updatedDate: new Date(),
          postReactions: true,
          postComments: true,
          commentReactions: true,
          postActivity: true,
        },
      });

      return user;
    });

    const output = plainToInstance(UserOutput, user, {
      excludeExtraneousValues: true,
    });
    return { output, activationCode: user.activationCode };
  }

  async generateNewActivationCode(
    ctx: RequestContext,
    resendVerifyEmailInputDto: AuthResendVerifyEmailInputDto,
  ) {
    this.logger.log(ctx, `${this.generateNewActivationCode.name} was called`);

    if (resendVerifyEmailInputDto.email !== undefined) {
      const user = await this.findByEmail(ctx, resendVerifyEmailInputDto.email);
      return this.prisma.user.update({
        where: { id: user.id },
        data: {
          activationCode: await this.generateCode(),
          activationCodeSentAt: new Date(),
        },
      });
    } else {
      const user = await this.findByUsername(
        ctx,
        resendVerifyEmailInputDto.username,
      );
      return this.prisma.user.update({
        where: { id: user.id },
        data: {
          activationCode: await this.generateCode(),
          activationCodeSentAt: new Date(),
        },
      });
    }
  }

  async validateUsernamePassword(
    ctx: RequestContext,
    username: string,
    pass: string,
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.validateUsernamePassword.name} was called`);

    this.logger.log(ctx, `calling findOne`);
    const user = await this.prisma.user.findFirst({
      where: { username: { equals: username, mode: 'insensitive' } },
    });
    if (!user) throw new UnauthorizedException('Invalid username or password');
    if (user.activated === false)
      throw new ForbiddenException('User is not activated');

    const match = await compare(pass, user.password);
    if (!match) throw new UnauthorizedException('Invalid username or password');

    return plainToInstance(UserOutput, user, {
      excludeExtraneousValues: true,
    });
  }

  async getUsers(
    ctx: RequestContext,
    limit: number,
    offset: number,
  ): Promise<{ users: UserOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getUsers.name} was called`);

    this.logger.log(ctx, `calling findAndCount`);
    const [count, users] = await this.prisma.$transaction([
      // @todo check if they ever change this shit solution
      this.prisma.user.count(),
      this.prisma.user.findMany({
        where: {},
        take: limit,
        skip: offset,
      }),
    ]);

    const usersOutput = plainToInstance(UserOutput, users, {
      excludeExtraneousValues: true,
    });

    return { users: usersOutput, count };
  }

  async getUsersAnon(
    ctx: RequestContext,
    limit: number,
    offset: number,
  ): Promise<{ users: UserOutputAnonymousDto[]; count: number }> {
    this.logger.log(ctx, `${this.getUsers.name} was called`);

    this.logger.log(ctx, `calling findAndCount`);
    const [count, users] = await this.prisma.$transaction([
      // @todo check if they ever change this shit solution
      this.prisma.user.count(),
      this.prisma.user.findMany({
        where: {},
        take: limit,
        skip: offset,
      }),
    ]);

    const usersOutput = plainToInstance(UserOutputAnonymousDto, users, {
      excludeExtraneousValues: true,
    });

    return { users: usersOutput, count };
  }

  async findById(ctx: RequestContext, id: string): Promise<UserOutput> {
    this.logger.log(ctx, `${this.findById.name} was called`);

    const user = await this.prisma.user.findUnique({ where: { id } });

    return plainToInstance(UserOutput, user, {
      excludeExtraneousValues: true,
    });
  }

  async getUserById(ctx: RequestContext, id: string): Promise<UserOutput> {
    this.logger.log(ctx, `${this.getUserById.name} was called`);

    const user = await this.prisma.user.findUnique({ where: { id } });

    return plainToInstance(UserOutput, user, {
      excludeExtraneousValues: true,
    });
  }

  async getUserBySlug(
    ctx: RequestContext,
    slug: string,
  ): Promise<UserOutputAnonymousDto> {
    this.logger.log(ctx, `${this.getUserBySlug.name} was called`);

    const user = await this.prisma.user.findUnique({ where: { slug } });

    return plainToInstance(UserOutputAnonymousDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async updateUser(
    ctx: RequestContext,
    userId: string,
    input: UpdateUserInput,
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.updateUser.name} was called`);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    // Hash the password if it exists in the input payload.
    if (input.password) {
      input.password = await hash(input.password, 10);
    }

    // merges the input (2nd line) to the found users (1st line)
    const updatedUser: User = {
      ...user,
      ...input,
    };

    await this.prisma.user.update({
      where: { id: userId },
      data: updatedUser,
    });

    return plainToInstance(UserOutput, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  async activateUser(
    ctx: RequestContext,
    activationDto: AuthVerifyEmailInputDto,
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.activateUser.name} was called`);

    let user;
    if (activationDto.email) {
      user = await this.prisma.user.findFirst({
        where: {
          AND: [
            { email: { equals: activationDto.email, mode: 'insensitive' } },
            { activationCode: { equals: activationDto.activationCode } },
          ],
        },
      });
    } else {
      user = await this.prisma.user.findFirst({
        where: {
          AND: [
            {
              username: { equals: activationDto.username, mode: 'insensitive' },
            },
            { activationCode: { equals: activationDto.activationCode } },
          ],
        },
      });
    }

    if (!user) throw new NotFoundException('Activation code is invalid');

    if (
      this.isExpired(user.activationCodeSentAt, 'auth.activationCodeExpiryInMs')
    )
      throw new ForbiddenException('Activation code is expired');

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        activationCode: null,
        activated: true,
        activationCodeSentAt: null,
      },
    });

    return plainToInstance(UserOutput, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  async changePassword(
    ctx: RequestContext,
    username: string,
    newPassword: string,
  ) {
    this.logger.log(ctx, `${this.changePassword.name} was called`);

    return this.prisma.user.update({
      where: { username },
      data: {
        password: await hash(newPassword, 10),
      },
    });
  }

  async updateLastLogin(ctx: RequestContext, id: string): Promise<User> {
    this.logger.log(ctx, `${this.updateLastLogin.name} was called`);

    return this.prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  resetPassword(ctx: RequestContext, email: string): Promise<User> {
    this.logger.log(ctx, `${this.resetPassword.name} was called`);

    return this.prisma.user
      .findFirst({
        where: {
          email: { equals: email, mode: 'insensitive' },
        },
      })
      .then(async (user) => {
        if (user.activated) {
          return this.prisma.user.update({
            where: { id: user.id },
            data: {
              resetKey: await this.generateCode(),
              resetDate: new Date(),
            },
          });
        }
        this.logger.log(ctx, `User is not activated`);
        throw new BadRequestException('User is not activated');
      })
      .catch((err) => {
        this.logger.warn(ctx, err);
        throw new NotFoundException('User not found');
      });
  }

  resetPasswordFinish(ctx: RequestContext, input: AuthPasswordResetFinishDto) {
    this.logger.log(ctx, `${this.resetPasswordFinish.name} was called`);

    this.logger.error(ctx, `INPUT: ${input}`);
    return this.prisma.user
      .findFirst({
        where: {
          AND: [
            { email: { equals: input.email, mode: 'insensitive' } },
            { resetKey: { equals: input.resetKey } },
          ],
        },
      })
      .then(async (user) => {
        if (user.resetDate) {
          // Ensure the reset key is not expired. <= auth.passwordResetTokenExpiryInMs
          if (
            !this.isExpired(user.resetDate, 'auth.passwordResetTokenExpiryInMs')
          ) {
            return this.prisma.user.update({
              where: { id: user.id },
              data: {
                password: await hash(input.newPassword, 10),
                resetKey: null,
                resetDate: null,
              },
            });
          } else {
            // Reset the keys
            this.prisma.user.update({
              where: { id: user.id },
              data: {
                resetKey: null,
                resetDate: null,
              },
            });
            this.logger.log(ctx, `Reset key is expired`);
            throw new BadRequestException('Reset key is expired');
          }
        }
        this.logger.log(ctx, `Reset key is invalid`);
        throw new BadRequestException('Reset key is invalid');
      })
      .catch((err) => {
        this.logger.log(ctx, err);
        throw new NotFoundException('Invalid Email or Reset Key Provided');
      });
  }

  usernameExists(ctx: RequestContext, username: string): Promise<boolean> {
    this.logger.log(ctx, `${this.usernameExists.name} was called`);

    return this.prisma.user
      .findFirst({
        where: { username: { equals: username, mode: 'insensitive' } },
      })
      .then((user) => {
        return !!user;
      })
      .catch(() => {
        this.logger.log(ctx, `Error finding user`);
        return false;
      });
  }

  findByEmail(ctx: RequestContext, email: string): Promise<UserOutput> {
    this.logger.log(ctx, `${this.findByEmail.name} was called`);

    return this.prisma.user
      .findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
      .then((user) => {
        return plainToInstance(UserOutput, user, {
          excludeExtraneousValues: true,
        });
      })
      .catch(() => {
        this.logger.log(ctx, `Error finding user with email: ${email}`);
        throw new NotFoundException('User not found');
      });
  }

  findByUsername(ctx: RequestContext, username: string): Promise<UserOutput> {
    this.logger.log(ctx, `${this.findByUsername.name} was called`);

    return this.prisma.user
      .findFirst({
        where: { username: { equals: username, mode: 'insensitive' } },
      })
      .then((user) => {
        return plainToInstance(UserOutput, user, {
          excludeExtraneousValues: true,
        });
      })
      .catch(() => {
        this.logger.log(ctx, `Error finding user with username: ${username}`);
        throw new NotFoundException('User not found');
      });
  }

  emailExists(ctx: RequestContext, email: string): Promise<boolean> {
    this.logger.log(ctx, `${this.emailExists.name} was called`);

    return this.prisma.user
      .findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
      .then((user) => {
        return !!user;
      })
      .catch(() => {
        this.logger.log(ctx, `Error finding user with email: ${email}`);
        return false;
      });
  }

  private async generateCode(): Promise<number> {
    // TODO: might want to make this more performant, instead of hitting the database every time
    let activationCode: number;
    let foundUser: User;
    do {
      activationCode = Math.floor(100000 + Math.random() * 900000);
      foundUser = await this.prisma.user.findUnique({
        where: { activationCode },
      });
    } while (foundUser);
    return activationCode;
  }

  verifyPasswordResetKey(
    ctx: RequestContext,
    input: AuthPasswordResetVerifyKeyDto,
  ) {
    this.logger.log(ctx, `${this.verifyPasswordResetKey.name} was called`);

    return this.prisma.user
      .findFirst({
        where: {
          AND: [
            { resetKey: { equals: input.resetKey } },
            { email: { equals: input.email, mode: 'insensitive' } },
          ],
        },
      })
      .then((user) => {
        if (user.resetDate) {
          if (
            !this.isExpired(user.resetDate, 'auth.passwordResetTokenExpiryInMs')
          ) {
            return true;
          } else {
            // Reset the keys
            this.prisma.user.update({
              where: { id: user.id },
              data: {
                resetKey: null,
                resetDate: null,
              },
            });
            this.logger.log(ctx, `Reset key is expired`);
            throw new BadRequestException('Reset key is expired');
          }
        }
        this.logger.log(ctx, `Reset key is invalid`);
        throw new BadRequestException('Reset key is invalid');
      })
      .catch((err) => {
        this.logger.log(ctx, err);
        throw new BadRequestException('Invalid Email or Reset Key Provided');
      });
  }

  private isExpired(sentDate: Date, configKey: string): boolean {
    const expiryMs = this.configService.get(configKey);
    return sentDate.getTime() + expiryMs < new Date().getTime();
  }
}
