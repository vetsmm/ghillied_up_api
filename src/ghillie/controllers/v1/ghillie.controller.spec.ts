import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { GhillieController } from './ghillie.controller';
import { AppLogger, RequestContext } from '../../../shared';
import { GhillieService } from '../../services/ghillie.service';
import { CreateGhillieInputDto } from '../../dtos/ghillie/create-ghillie-input.dto';

describe('GhillieController', () => {
    let moduleRef: TestingModule;
    let ghillieController: GhillieController;

    const mockedGhillieService = {
        createGhillie: jest.fn(),
    };

    const mockedLogger = { setContext: jest.fn(), log: jest.fn() };

    beforeEach(async () => {
        moduleRef = await Test.createTestingModule({
            controllers: [GhillieController],
            providers: [
                { provide: GhillieService, useValue: mockedGhillieService },
                { provide: AppLogger, useValue: mockedLogger },
            ],
        }).compile();

        ghillieController = moduleRef.get<GhillieController>(GhillieController);
    });

    it('should be defined', () => {
        expect(ghillieController).toBeDefined();
    });

    const ctx = new RequestContext();

    describe('createGhillie', () => {
        it('should create a new ghillie', async () => {
            const createGhillieInputDto: CreateGhillieInputDto = {
                adminInviteOnly: false,
                category: undefined,
                isPrivate: false,
                name: 'My Ghillie',
                about: 'My Ghillie Description',
                readOnly: false,
            };

            jest.spyOn(
                mockedGhillieService,
                'createGhillie',
            ).mockImplementation(async () => null);

            expect(
                await ghillieController.createGhillie(
                    ctx,
                    createGhillieInputDto,
                ),
            ).toEqual({
                data: null,
                meta: {},
            });
        });

        it('should create a new ghillie with topics', async () => {
            const createGhillieInputDto: CreateGhillieInputDto = {
                adminInviteOnly: false,
                category: undefined,
                isPrivate: false,
                name: 'My Ghillie',
                about: 'My Ghillie Description',
                readOnly: false,
                topicNames: ['Topic 1', 'Topic 2'],
            };

            jest.spyOn(
                mockedGhillieService,
                'createGhillie',
            ).mockImplementation(async () => null);

            expect(
                await ghillieController.createGhillie(
                    ctx,
                    createGhillieInputDto,
                ),
            ).toEqual({
                data: null,
                meta: {},
            });
        });
    });
});
