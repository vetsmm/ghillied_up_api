import { Test, TestingModule } from '@nestjs/testing';

import { UserOutput } from '../dtos/public/user-output.dto';
import { UpdateUserInput } from '../dtos/public/user-update-input.dto';
import { UserService } from '../services/user.service';
import { UserController } from './user.controller';
import { ServiceBranch, ServiceStatus, UserAuthority } from '@prisma/client';

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { AppLogger, PaginationParamsDto, RequestContext } from '../../shared';

describe('UserController', () => {
  let controller: UserController;
  const mockedUserService = {
    getUsers: jest.fn(),
    getUserById: jest.fn(),
    updateUser: jest.fn(),
  };

  const mockedLogger = { setContext: jest.fn(), log: jest.fn() };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockedUserService },
        { provide: AppLogger, useValue: mockedLogger },
      ],
    }).compile();

    controller = moduleRef.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const ctx = new RequestContext();

  describe('get Users as a list', () => {
    it('Calls getUsers function', () => {
      const query: PaginationParamsDto = {
        offset: 0,
        limit: 0,
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      mockedUserService.getUsers.mockResolvedValue({ users: [], count: 0 });
      controller.getUsers(ctx, query);
      expect(mockedUserService.getUsers).toHaveBeenCalled();
    });
  });

  const currentDate = new Date().toString();

  const expectedOutput: UserOutput = {
    id: '1',
    username: 'default-users',
    slug: 'default-users',
    firstName: 'default-name',
    lastName: 'default-last-name',
    authorities: [UserAuthority.ROLE_USER],
    activated: true,
    email: 'e2etester@random.com',
    createdDate: currentDate,
    updatedDate: currentDate,
    branch: ServiceBranch.AIR_FORCE,
    serviceStatus: ServiceStatus.ACTIVE_DUTY,
    isVerifiedMilitary: true,
    serviceEntryDate: currentDate,
    serviceExitDate: currentDate,
    lastLoginAt: currentDate,
    imageUrl: 'https://random.com/image.jpg',
  };

  describe('Get users by id', () => {
    it('should call services method getUserById with id', async () => {
      const id = '1';
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      mockedUserService.getUserById.mockResolvedValue(expectedOutput);

      expect(await controller.getUser(ctx, id)).toEqual({
        data: expectedOutput,
        meta: {},
      });
      expect(mockedUserService.getUserById).toHaveBeenCalledWith(ctx, id);
    });
  });

  describe('Update users by id', () => {
    it('Update users by id and returns users', async () => {
      const input = new UpdateUserInput();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      mockedUserService.updateUser.mockResolvedValue(expectedOutput);

      expect(await controller.updateUser(ctx, '1', input)).toEqual({
        data: expectedOutput,
        meta: {},
      });
    });
  });
});
