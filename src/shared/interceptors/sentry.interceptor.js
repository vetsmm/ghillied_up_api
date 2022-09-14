"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.SentryInterceptor = void 0;
var common_1 = require("@nestjs/common");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var Sentry = require("@sentry/node");
var errorsToTrackInSentry = [common_1.InternalServerErrorException, TypeError];
var enableSentry = function (err) {
    var sendToSentry = errorsToTrackInSentry.some(function (errorType) { return err instanceof errorType; });
    if (sendToSentry)
        Sentry.captureException(err);
    return (0, rxjs_1.throwError)(err);
};
var SentryInterceptor = /** @class */ (function () {
    function SentryInterceptor(env) {
        this.env = env;
        this.env = env;
    }
    SentryInterceptor.prototype.intercept = function (context, next) {
        console.log('SentryInterceptor', this.env == 'production');
        if (this.env == 'production')
            return next.handle().pipe((0, operators_1.catchError)(enableSentry));
        else
            return next.handle().pipe((0, operators_1.catchError)(function (err) { return (0, rxjs_1.throwError)(err); }));
    };
    SentryInterceptor = __decorate([
        (0, common_1.Injectable)()
    ], SentryInterceptor);
    return SentryInterceptor;
}());
exports.SentryInterceptor = SentryInterceptor;
