"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.SharedModule = void 0;
var common_1 = require("@nestjs/common");
var config_1 = require("@nestjs/config");
var module_options_1 = require("./configs/module-options");
var logger_module_1 = require("./logger/logger.module");
var mail_1 = require("./mail");
var mailer_1 = require("@vetsmm/mailer");
var SharedModule = /** @class */ (function () {
    function SharedModule() {
    }
    SharedModule = __decorate([
        (0, common_1.Module)({
            imports: [
                config_1.ConfigModule.forRoot(module_options_1.configModuleOptions),
                logger_module_1.AppLoggerModule,
                mail_1.MailModule,
                mailer_1.MailerModule.forRootAsync({
                    useClass: mail_1.MailConfigService
                }),
            ],
            controllers: [],
            providers: [],
            exports: [logger_module_1.AppLoggerModule, config_1.ConfigModule, mail_1.MailModule]
        })
    ], SharedModule);
    return SharedModule;
}());
exports.SharedModule = SharedModule;
