import * as Joi from '@hapi/joi';
import { ConfigModuleOptions } from '@nestjs/config/dist/interfaces';

import configuration from './configuration';

export const configModuleOptions: ConfigModuleOptions = {
    cache: true,
    isGlobal: true,
    load: [configuration],
    // validationSchema: Joi.object({
    //     DATABASE_URL: Joi.string().required(),
    //     JWT_PUBLIC_KEY_BASE64: Joi.string().required(),
    //     JWT_PRIVATE_KEY_BASE64: Joi.string().required(),
    //     JWT_ACCESS_TOKEN_EXP_IN_SEC: Joi.number().required(),
    //     JWT_REFRESH_TOKEN_EXP_IN_SEC: Joi.number().required(),
    //     DEFAULT_ADMIN_USER_PASSWORD: Joi.string().required(),
    //     MAIL_PORT: Joi.number().required(),
    //     MAIL_HOST: Joi.string(),
    //     MAIL_USER: Joi.string().required(),
    //     MAIL_PASSWORD: Joi.string().required(),
    //     MAIL_DEFAULT_EMAIL: Joi.string(),
    //     MAIL_IGNORE_TLS: Joi.boolean().required(),
    //     MAIL_SECURE: Joi.boolean().required(),
    //     MAIL_REQUIRE_TLS: Joi.boolean().required(),
    //     STREAM_APP_ID: Joi.string().required(),
    //     STREAM_API_KEY: Joi.string().required(),
    //     STREAM_API_SECRET: Joi.string().required(),
    //     // FIREBASE_CLIENT_EMAIL: Joi.string().required(),
    //     // FIREBASE_PRIVATE_KEY: Joi.string().required(),
    //     // FIREBASE_PROJECT_ID: Joi.string().required(),
    // }),
};
