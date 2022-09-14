"use strict";
exports.__esModule = true;
exports.configModuleOptions = void 0;
var Joi = require("@hapi/joi");
var configuration_1 = require("./configuration");
exports.configModuleOptions = {
    isGlobal: true,
    load: [configuration_1["default"]],
    validationSchema: Joi.object({
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
        SENTRY_DSN: Joi.string().uri()["default"]('')
    })
};
