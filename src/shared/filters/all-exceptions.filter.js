"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AllExceptionsFilter = void 0;
var common_1 = require("@nestjs/common");
var constants_1 = require("../constants");
var exceptions_1 = require("../exceptions");
var runtime_1 = require("@prisma/client/runtime");
var request_context_1 = require("../request-context");
var AllExceptionsFilter = /** @class */ (function () {
    /** set logger context */
    function AllExceptionsFilter(config, logger) {
        this.config = config;
        this.logger = logger;
        this.logger.setContext(AllExceptionsFilter_1.name);
    }
    AllExceptionsFilter_1 = AllExceptionsFilter;
    AllExceptionsFilter.prototype["catch"] = function (exception, host) {
        var ctx = host.switchToHttp();
        var req = ctx.getRequest();
        var res = ctx.getResponse();
        var path = req.url;
        var timestamp = new Date().toISOString();
        var requestId = req.headers[constants_1.REQUEST_ID_TOKEN_HEADER];
        var requestContext = (0, request_context_1.createRequestContext)(req);
        var stack;
        var errorName;
        // TODO : Based on language value in header, return a localized message.
        // const acceptedLanguage = 'en';
        var builder = exceptions_1.BaseApiException.builder();
        // TODO : Refactor the below cases into a switch case and tidy up error response creation.
        if (exception instanceof exceptions_1.BaseApiException) {
            builder.withBaseApiException(exception);
        }
        else if (exception instanceof exceptions_1.ValidationException) {
            builder.withBaseApiException((0, exceptions_1.validationExceptionParser)(exception));
        }
        else if (exception instanceof common_1.HttpException) {
            builder.withStatus(exception.getStatus()).withMessage(exception.message);
        }
        else if (exception instanceof runtime_1.PrismaClientKnownRequestError) {
            builder.withBaseApiException(exceptions_1.prismaParsers.buildError(exception));
        }
        else if (exception instanceof common_1.UnauthorizedException) {
            builder
                .withCategory(exceptions_1.GhilliedUpErrorCategories.AuthorizationError)
                .withSubCategory(exceptions_1.GhilliedUpErrorCategories.AuthorizationError)
                .withStatus(common_1.HttpStatus.UNAUTHORIZED)
                .withMessage(exception.message);
        }
        else if (exception instanceof Error) {
            builder
                .withCategory(exceptions_1.GhilliedUpErrorCategories.UnknownError)
                .withSubCategory(exceptions_1.GhilliedUpErrorCategories.UnknownError)
                .withMessage('An unknown error has occurred.');
            stack = exception.stack;
        }
        errorName = exception.constructor.name;
        // NOTE: For reference, please check https://cloud.google.com/apis/design/errors
        var baseApiException = builder.build();
        var error = {
            statusCode: baseApiException.getStatus(),
            message: baseApiException.message,
            localizedMessage: baseApiException.localizedMessage,
            category: baseApiException.category,
            subCategory: baseApiException.subCategory,
            context: baseApiException.context,
            errorName: errorName || 'InternalException',
            // Additional meta added by us.
            path: path,
            requestId: requestId,
            timestamp: timestamp
        };
        this.logger.warn(requestContext, error.message, {
            error: error,
            stack: stack
        });
        // Suppress original internal server error details in prod mode
        var isProMood = this.config.get('env') !== 'development';
        if (isProMood &&
            baseApiException.getStatus() === common_1.HttpStatus.INTERNAL_SERVER_ERROR) {
            error.message = 'Internal server error';
        }
        res.status(baseApiException.getStatus()).json({ error: error });
    };
    var AllExceptionsFilter_1;
    AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
        (0, common_1.Catch)()
    ], AllExceptionsFilter);
    return AllExceptionsFilter;
}());
exports.AllExceptionsFilter = AllExceptionsFilter;
