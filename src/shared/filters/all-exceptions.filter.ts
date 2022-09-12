import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

import { REQUEST_ID_TOKEN_HEADER } from '../constants';

import {
  BaseApiException,
  BaseApiExceptionBuilder,
  GhilliedUpErrorCategories,
  prismaParsers,
  ValidationException,
  validationExceptionParser,
} from '../exceptions';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { AppLogger } from '../logger';
import { createRequestContext } from '../request-context';

@Catch()
export class AllExceptionsFilter<T> implements ExceptionFilter {
  /** set logger context */
  constructor(
    private config: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: T, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const req: Request = ctx.getRequest<Request>();
    const res: Response = ctx.getResponse<Response>();

    const path = req.url;
    const timestamp = new Date().toISOString();
    const requestId = req.headers[REQUEST_ID_TOKEN_HEADER];
    const requestContext = createRequestContext(req);

    let stack: any;
    let errorName: string;
    // TODO : Based on language value in header, return a localized message.
    // const acceptedLanguage = 'en';

    const builder: BaseApiExceptionBuilder = BaseApiException.builder();

    // TODO : Refactor the below cases into a switch case and tidy up error response creation.
    if (exception instanceof BaseApiException) {
      builder.withBaseApiException(exception);
    } else if (exception instanceof ValidationException) {
      builder.withBaseApiException(validationExceptionParser(exception));
    } else if (exception instanceof HttpException) {
      builder.withStatus(exception.getStatus()).withMessage(exception.message);
    } else if (exception instanceof PrismaClientKnownRequestError) {
      builder.withBaseApiException(prismaParsers.buildError(exception));
    } else if (exception instanceof UnauthorizedException) {
      builder
        .withCategory(GhilliedUpErrorCategories.AuthorizationError)
        .withSubCategory(GhilliedUpErrorCategories.AuthorizationError)
        .withStatus(HttpStatus.UNAUTHORIZED)
        .withMessage(exception.message);
    } else if (exception instanceof Error) {
      builder
        .withCategory(GhilliedUpErrorCategories.UnknownError)
        .withSubCategory(GhilliedUpErrorCategories.UnknownError)
        .withMessage('An unknown error has occurred.');
      stack = exception.stack;
    }

    errorName = exception.constructor.name;
    // NOTE: For reference, please check https://cloud.google.com/apis/design/errors
    const baseApiException: BaseApiException = builder.build();
    const error = {
      statusCode: baseApiException.getStatus(),
      message: baseApiException.message,
      localizedMessage: baseApiException.localizedMessage,
      category: baseApiException.category,
      subCategory: baseApiException.subCategory,
      context: baseApiException.context,
      errorName: errorName || 'InternalException',
      // Additional meta added by us.
      path,
      requestId,
      timestamp,
    };
    this.logger.warn(requestContext, error.message, {
      error,
      stack,
    });

    // Suppress original internal server error details in prod mode
    const isProMood = this.config.get<string>('env') !== 'development';
    if (
      isProMood &&
      baseApiException.getStatus() === HttpStatus.INTERNAL_SERVER_ERROR
    ) {
      error.message = 'Internal server error';
    }

    res.status(baseApiException.getStatus()).json({ error });
  }
}
