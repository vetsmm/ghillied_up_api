/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as ip from 'ip';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { environment } from './environments/environment.prod';
import {
  SentryInterceptor,
  VALIDATION_PIPE_OPTIONS,
  RequestIdMiddleware,
} from './shared';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe(VALIDATION_PIPE_OPTIONS));
  app.use(RequestIdMiddleware);
  app.enableCors();

  if (environment.production) {
    const config = new DocumentBuilder()
      .setTitle('Ghillied Up')
      .setDescription('The Ghillied Up API description')
      .setVersion('0.1')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger-ui', app, document);

    const appConfig = app.get(ConfigService);
    const client = new PrismaClient();
    Sentry.init({
      dsn: appConfig.get('sentryDsn'),
      integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Tracing.Integrations.Prisma({ client }),
      ],

      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,
    });
    app.useGlobalInterceptors(
      new SentryInterceptor(
        environment.production ? 'production' : 'development',
      ),
    );
  }

  const port = process.env.PORT || 3333;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://${ip.address()}:${port}`);
}

bootstrap();
