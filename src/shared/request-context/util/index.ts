import { plainToInstance } from 'class-transformer';
import { Request } from 'express';

import {
    FORWARDED_FOR_TOKEN_HEADER,
    REQUEST_ID_TOKEN_HEADER,
    REQUEST_USER_AGENT_HEADER,
} from '../../constants';
import { RequestContext } from '../request-context.dto';
import { UserAccessTokenClaims } from '../../auth/dtos';

// Creates a RequestContext object from Request
export function createRequestContext(request: Request): RequestContext {
    const ctx = new RequestContext();
    ctx.requestID = request.header(REQUEST_ID_TOKEN_HEADER);
    ctx.url = request.url;
    ctx.ip = request.header(FORWARDED_FOR_TOKEN_HEADER)
        ? request.header(FORWARDED_FOR_TOKEN_HEADER)
        : request.ip;
    ctx.userAgent = request.header(REQUEST_USER_AGENT_HEADER);

    // If request.users does not exist, we explicitly set it to null.
    ctx.user = request.user
        ? plainToInstance(UserAccessTokenClaims, request.user, {
              excludeExtraneousValues: true,
          })
        : null;
    ctx.os = request.useragent.os;
    ctx.platform = request.useragent.platform;
    ctx.isMobile = request.useragent.isMobile;

    return ctx;
}
