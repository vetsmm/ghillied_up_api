import * as Sentry from '@sentry/node';
import { Extras } from '@sentry/types/types/extra';
import { RequestContext } from '../request-context';

export const sendSentryError = (
    ctx: RequestContext,
    error: unknown extends Error ? Error : unknown,
    extra?: Extras,
) => {
    Sentry.captureException(error, {
        extra: {
            ...extra,
            userId: ctx.user.id,
            ip: ctx.ip,
            requestId: ctx.requestID,
            requestUrl: ctx.url,
        },
    });
};
