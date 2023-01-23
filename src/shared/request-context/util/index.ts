import { Request } from 'express';
import { RequestContext } from '../request-context.dto';

// Creates a RequestContext object from Request
export function createRequestContext(request: Request): RequestContext {
    return RequestContext.createFromRequest(request);
}
