import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { createRequestContext } from './util';
import { RequestContext } from './request-context.dto';

export const ReqContext = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): RequestContext => {
        const request = ctx.switchToHttp().getRequest();

        return createRequestContext(request);
    },
);
