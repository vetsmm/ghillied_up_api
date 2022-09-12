import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { UserOutput } from '../../user/dtos/public/user-output.dto';
import { UserService } from '../../user/services/user.service';
import {
  AuthTokenOutput,
  MailService,
  RequestContext,
  AppLogger,
  UserAccessTokenClaims,
} from '../../shared';
import { AuthService } from './auth.service';
import { ServiceBranch, ServiceStatus, UserAuthority } from '@prisma/client';

import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';

describe('AuthService', () => {
  let service: AuthService;

  const accessTokenClaims: UserAccessTokenClaims = {
    id: '6',
    username: 'jhon',
    authorities: [UserAuthority.ROLE_USER],
  };

  // const registerInput = {
  //   username: 'jhon',
  //   firstName: 'Jhon',
  //   lastName: 'doe',
  //   password: 'any password',
  //   authorities: [UserAuthority.ROLE_USER],
  //   activated: true,
  //   email: 'randomUser@random.com',
  //   serviceEntryDate: new Date(),
  //   serviceExitDate: new Date(),
  //   branch: ServiceBranch.AIR_FORCE,
  //   serviceStatus: ServiceStatus.ACTIVE_DUTY,
  // };

  const currentDate = new Date().toString();

  // const registerOutput: RegisterOutput = {
  //   id: '6',
  //   username: 'jhon',
  //   slug: 'jhon',
  //   firstName: 'Jhon',
  //   lastName: 'doe',
  //   authorities: [UserAuthority.ROLE_USER],
  //   activated: true,
  //   email: 'randomUser@random.com',
  //   createdDate: currentDate,
  //   updatedDate: currentDate,
  // };

  const userOutput: UserOutput = {
    username: 'jhon',
    slug: 'jhon',
    firstName: 'Jhon',
    lastName: 'doe',
    authorities: [UserAuthority.ROLE_USER],
    activated: true,
    email: 'randomUser@random.com',
    createdDate: currentDate,
    updatedDate: currentDate,
    branch: ServiceBranch.AIR_FORCE,
    serviceStatus: ServiceStatus.ACTIVE_DUTY,
    serviceEntryDate: currentDate,
    serviceExitDate: currentDate,
    isVerifiedMilitary: true,
    lastLoginAt: currentDate,
    imageUrl: null,
    ...accessTokenClaims,
  };

  const authToken: AuthTokenOutput = {
    accessToken: 'random_access_token',
    refreshToken: 'random_refresh_token',
  };

  const mockedUserService = {
    findById: jest.fn(),
    createUser: jest.fn(),
    validateUsernamePassword: jest.fn(),
    updateLastLogin: jest.fn(),
  };

  const mockedJwtService = {
    sign: jest.fn(),
  };

  const mockedConfigService = { get: jest.fn() };

  const mockedAppLogger = { setContext: jest.fn(), log: jest.fn() };

  const mockedMailerService = {
    sendUserActivation: jest.fn(),
    sendPasswordReset: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockedUserService },
        { provide: JwtService, useValue: mockedJwtService },
        { provide: ConfigService, useValue: mockedConfigService },
        { provide: AppLogger, useValue: mockedAppLogger },
        { provide: MailService, useValue: mockedMailerService },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const ctx = new RequestContext();

  describe('validateUser', () => {
    it('should success when username/password valid', async () => {
      jest
        .spyOn(mockedUserService, 'validateUsernamePassword')
        .mockImplementation(() => userOutput);

      expect(await service.validateUser(ctx, 'jhon', 'somepass')).toEqual(
        userOutput,
      );
      expect(mockedUserService.validateUsernamePassword).toBeCalledWith(
        ctx,
        'jhon',
        'somepass',
      );
    });

    it('should fail when username/password invalid', async () => {
      jest
        .spyOn(mockedUserService, 'validateUsernamePassword')
        .mockImplementation(() => {
          throw new UnauthorizedException();
        });

      await expect(
        service.validateUser(ctx, 'jhon', 'somepass'),
      ).rejects.toThrowError(UnauthorizedException);
    });

    it('should fail when users account is disabled', async () => {
      jest
        .spyOn(mockedUserService, 'validateUsernamePassword')
        .mockImplementation(() => ({ ...userOutput, activated: false }));

      await expect(
        service.validateUser(ctx, 'jhon', 'somepass'),
      ).rejects.toThrowError(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return auth token for valid users', async () => {
      jest.spyOn(service, 'getAuthToken').mockImplementation(() => authToken);

      const result = service.login(ctx);

      expect(service.getAuthToken).toBeCalledWith(ctx, accessTokenClaims);
      expect(result).toEqual(authToken);
    });
  });

  // describe('register', () => {
  //   it('should register new users', async () => {
  //     jest
  //       .spyOn(mockedUserService, 'createUser')
  //       .mockImplementation(() => userOutput);
  //
  //     const result = await services.register(ctx, registerInput);
  //
  //     expect(mockedUserService.createUser).toBeCalledWith(ctx, registerInput);
  //     expect(result).toEqual(registerOutput);
  //   });
  // });

  describe('refreshToken', () => {
    ctx.user = accessTokenClaims;

    it('should generate auth token', async () => {
      jest
        .spyOn(mockedUserService, 'findById')
        .mockImplementation(async () => userOutput);

      jest.spyOn(service, 'getAuthToken').mockImplementation(() => authToken);

      const result = await service.refreshToken(ctx);

      expect(service.getAuthToken).toBeCalledWith(ctx, userOutput);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(result).toMatchObject(authToken);
    });

    it('should throw exception when users is not valid', async () => {
      jest
        .spyOn(mockedUserService, 'findById')
        .mockImplementation(async () => null);

      await expect(service.refreshToken(ctx)).rejects.toThrowError(
        'Invalid users id',
      );
    });

    afterEach(() => {
      jest.resetAllMocks();
    });
  });

  describe('getAuthToken', () => {
    const accessTokenExpiry = 100;
    const refreshTokenExpiry = 200;
    const user = {
      id: '5',
      username: 'username',
      authorities: [UserAuthority.ROLE_USER],
    };

    const subject = { sub: user.id };
    const payload = {
      username: user.username,
      sub: user.id,
      authorities: [UserAuthority.ROLE_USER],
    };

    beforeEach(() => {
      jest.spyOn(mockedConfigService, 'get').mockImplementation((key) => {
        let value = null;
        switch (key) {
          case 'jwt.accessTokenExpiresInSec':
            value = accessTokenExpiry;
            break;
          case 'jwt.refreshTokenExpiresInSec':
            value = refreshTokenExpiry;
            break;
        }
        return value;
      });

      jest
        .spyOn(mockedJwtService, 'sign')
        .mockImplementation(() => 'signed-response');
    });

    it('should generate access token with payload', () => {
      const result = service.getAuthToken(ctx, user);

      expect(mockedJwtService.sign).toBeCalledWith(
        { ...payload, ...subject },
        { expiresIn: accessTokenExpiry },
      );

      expect(result).toMatchObject({
        accessToken: 'signed-response',
      });
    });

    it('should generate refresh token with subject', () => {
      const result = service.getAuthToken(ctx, user);

      expect(mockedJwtService.sign).toBeCalledWith(subject, {
        expiresIn: refreshTokenExpiry,
      });

      expect(result).toMatchObject({
        refreshToken: 'signed-response',
      });
    });

    afterEach(() => {
      jest.resetAllMocks();
    });
  });
});
