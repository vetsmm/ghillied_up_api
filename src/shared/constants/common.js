"use strict";
exports.__esModule = true;
exports.VALIDATION_PIPE_OPTIONS = exports.FORWARDED_FOR_TOKEN_HEADER = exports.REQUEST_ID_TOKEN_HEADER = void 0;
var exceptions_1 = require("../exceptions");
exports.REQUEST_ID_TOKEN_HEADER = 'x-request-id';
exports.FORWARDED_FOR_TOKEN_HEADER = 'x-forwarded-for';
exports.VALIDATION_PIPE_OPTIONS = {
    transform: true,
    whitelist: true,
    forbidUnknownValues: true,
    exceptionFactory: function (validationErrors) {
        if (validationErrors === void 0) { validationErrors = []; }
        return new exceptions_1.ValidationException(validationErrors);
    }
};
