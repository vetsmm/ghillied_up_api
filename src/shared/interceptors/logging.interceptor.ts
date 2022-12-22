import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLogger } from '../logger';
import { createRequestContext } from '../request-context';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private appLogger: AppLogger) {
        this.appLogger.setContext(LoggingInterceptor.name);
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const ctx = createRequestContext(request);

        const now = Date.now();
        return next.handle().pipe(
            tap(() => {
                const response = context.switchToHttp().getResponse();
                const statusCode = response.statusCode;

                // Response time in milliseconds
                const responseTime = `${Date.now() - now}ms`;

                const resData = { method, statusCode, responseTime };

                // If the request is coming from /health, we don't want to log it
                if (request.url !== '/health') {
                    this.appLogger.log(ctx, 'Request completed', { resData });
                }
            }),
        );
    }
}
