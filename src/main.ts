/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as ip from 'ip';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import * as userAgent from 'express-useragent';

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
import * as firebase from 'firebase-admin';
import { AWSSecretsService } from './shared/secrets-manager';

function initFirebase(
    secretsService: AWSSecretsService,
    configServer: ConfigService,
) {
    if (configServer.get('appEnv') === 'DEV') {
        const firebaseConfig = configServer.get('firebase');
        firebase.initializeApp({
            credential: firebase.credential.cert({
                projectId: firebaseConfig.projectId,
                clientEmail: firebaseConfig.clientEmail,
                privateKey: firebaseConfig.privateKey,
            }),
        });
        Logger.log('Firebase - Initialized');
        return;
    }
    secretsService
        .getSecrets<{
            FIREBASE_PRIVATE_KEY: string;
            FIREBASE_PROJECT_ID: string;
            FIREBASE_CLIENT_EMAIL: string;
        }>(configServer.get('secretsSources.firebase'))
        .then((firebaseConfig) => {
            firebase.initializeApp({
                credential: firebase.credential.cert({
                    projectId: firebaseConfig.FIREBASE_PROJECT_ID,
                    clientEmail: firebaseConfig.FIREBASE_CLIENT_EMAIL,
                    privateKey: firebaseConfig.FIREBASE_PRIVATE_KEY,
                }),
            });
            Logger.log('Firebase - Initialized');
        })
        .catch((err) => {
            Logger.error('Firebase - Failed to initialize', err);
        });
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(userAgent.express());
    app.useGlobalPipes(new ValidationPipe(VALIDATION_PIPE_OPTIONS));
    app.use(RequestIdMiddleware);
    app.enableCors();

    const appConfig = app.get(ConfigService);
    const secretsService = app.get(AWSSecretsService);

    if (environment.production) {
        const config = new DocumentBuilder()
            .setTitle('Ghillied Up')
            .setDescription('The Ghillied Up API description')
            .setVersion('0.1')
            .addBearerAuth()
            .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('swagger-ui', app, document);

        const client = new PrismaClient();
        Sentry.init({
            dsn: appConfig.get('sentryDsn'),
            integrations: [
                // enable HTTP calls tracing
                new Sentry.Integrations.Http({ tracing: true }),
                // enable Express.js middleware tracing
                new Tracing.Integrations.Prisma({ client }),
                new Sentry.Integrations.OnUncaughtException(),
                new Sentry.Integrations.OnUnhandledRejection(),
            ],

            // Set tracesSampleRate to 1.0 to capture 100%
            // of transactions for performance monitoring.
            // We recommend adjusting this value in production
            tracesSampleRate: 1.0,
        });
    }

    app.useGlobalInterceptors(
        new SentryInterceptor(
            environment.production ? 'production' : 'development',
        ),
    );
    initFirebase(secretsService, appConfig);
    const port = process.env.PORT || 3333;
    await app.listen(port);
    Logger.log(
        `🚀 Application - ENV:${appConfig.get(
            'appEnv',
        )} -  is running on: http://${ip.address()}:${port}`,
    );
}

bootstrap();
