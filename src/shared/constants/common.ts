import { ValidationError } from '@nestjs/common';
import { ValidationException } from '../exceptions';

export const REQUEST_ID_TOKEN_HEADER = 'x-request-id';

export const FORWARDED_FOR_TOKEN_HEADER = 'x-forwarded-for';

export const REQUEST_USER_AGENT_HEADER = 'User-Agent';

export const VALIDATION_PIPE_OPTIONS = {
    transform: true,
    whitelist: true,
    forbidUnknownValues: true,
    exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new ValidationException(validationErrors);
    },
};
