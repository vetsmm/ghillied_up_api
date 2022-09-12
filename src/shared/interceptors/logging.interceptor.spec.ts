import { describe, beforeEach, it, expect } from '@jest/globals';
import { LoggingInterceptor } from './logging.interceptor';
import { AppLogger } from '../logger';

describe('LoggingInterceptor', () => {
  let loggingInterceptor: LoggingInterceptor;

  // const mockRequest = {
  //   headers: {},
  //   url: 'mock-url',
  //   header: jest.fn(),
  // };

  // const mockExecutionContext = {
  //   switchToHttp: jest.fn().mockReturnThis(),
  //   getRequest: jest.fn().mockReturnThis(),
  // } as unknown as ExecutionContext;
  //
  // const mockCallHandler = {
  //   handle: jest.fn(),
  //   pipe: jest.fn().mockReturnThis(),
  // };

  beforeEach(async () => {
    loggingInterceptor = new LoggingInterceptor(new AppLogger());
  });

  it('should be defined', () => {
    expect(loggingInterceptor).toBeDefined();
  });

  // describe('intercept', () => {
  //   it('intercept', async () => {
  //     // @ts-ignore
  //     (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValueOnce(mockRequest);
  //     mockCallHandler.handle.mockReturnValueOnce({
  //       pipe: jest.fn(),
  //     });
  //
  //     const createRequestContext = jest.spyOn(utils, 'createRequestContext');
  //
  //     // @ts-ignore
  //     loggingInterceptor.intercept(mockExecutionContext, mockCallHandler);
  //
  //     expect(mockExecutionContext.switchToHttp().getRequest).toHaveBeenCalled();
  //     expect(createRequestContext).toHaveBeenCalledWith(mockRequest);
  //   });
  // });
});
