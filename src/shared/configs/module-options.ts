import * as Joi from '@hapi/joi';
import {ConfigModuleOptions} from '@nestjs/config/dist/interfaces';

import configuration from './configuration';

export const configModuleOptions: ConfigModuleOptions = {
    isGlobal: true,
    load: [configuration],
    validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_PUBLIC_KEY_BASE64: Joi.string().required(),
        JWT_PRIVATE_KEY_BASE64: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXP_IN_SEC: Joi.number().required(),
        JWT_REFRESH_TOKEN_EXP_IN_SEC: Joi.number().required(),
        DEFAULT_ADMIN_USER_PASSWORD: Joi.string().required(),
        FRONTEND_DOMAIN: Joi.string().required(),
        BACKEND_DOMAIN: Joi.string().required(),
        MAIL_PORT: Joi.number().required(),
        MAIL_HOST: Joi.string().required(),
        MAIL_USER: Joi.string().required(),
        MAIL_PASSWORD: Joi.string().required(),
        MAIL_DEFAULT_EMAIL: Joi.string().required(),
        MAIL_DEFAULT_NAME: Joi.string().required(),
        MAIL_IGNORE_TLS: Joi.boolean().required(),
        MAIL_SECURE: Joi.boolean().required(),
        MAIL_REQUIRE_TLS: Joi.boolean().required(),
        SENTRY_DSN: Joi.string().uri().default(''),
        AWS_SNS_ACTIVITY_ARN: Joi.string().required(),
        AWS_REGION: Joi.string().default('us-east-1'),
    }),
};
