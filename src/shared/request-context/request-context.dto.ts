import { UserAccessTokenClaims } from '../auth/dtos';
import { plainToInstance } from 'class-transformer';
import {
    FORWARDED_FOR_TOKEN_HEADER,
    REQUEST_ID_TOKEN_HEADER,
    REQUEST_USER_AGENT_HEADER,
} from '../constants';
import { Request } from 'express';

export class RequestContext {
    public requestID: string;
    public url: string;
    public ip: string;
    public userAgent: string;
    public os: string;
    public platform: string;
    public isMobile: boolean;
    public user: UserAccessTokenClaims;

    public static createFromRequest(request: Request): RequestContext {
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
}

export class RequestContextType {
    public requestID: string;
    public url: string;
    public ip: string;
    public userAgent: string;
    public os: string;
    public platform: string;
    public isMobile: boolean;
    public user: UserAccessTokenClaims;
}
