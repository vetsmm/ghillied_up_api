"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.MailConfigService = void 0;
var path = require("path");
var common_1 = require("@nestjs/common");
var handlebars_adapter_1 = require("@vetsmm/mailer/dist/adapters/handlebars.adapter");
var MailConfigService = /** @class */ (function () {
    function MailConfigService(configService) {
        this.configService = configService;
    }
    MailConfigService.prototype.createMailerOptions = function () {
        return {
            transport: {
                host: this.configService.get('mail.host'),
                port: this.configService.get('mail.port'),
                ignoreTLS: this.configService.get('mail.ignoreTLS'),
                secure: this.configService.get('mail.secure'),
                requireTLS: this.configService.get('mail.requireTLS'),
                auth: {
                    user: this.configService.get('mail.user'),
                    pass: this.configService.get('mail.password')
                }
            },
            defaults: {
                from: "\"".concat(this.configService.get('mail.defaultName'), "\" <").concat(this.configService.get('mail.defaultEmail'), ">")
            },
            template: {
                // Get the templates direction from the current directory
                dir: path.join(__dirname, 'assets', 'mail-templates'),
                adapter: new handlebars_adapter_1.HandlebarsAdapter(),
                options: {
                    strict: true
                }
            }
        };
    };
    MailConfigService = __decorate([
        (0, common_1.Injectable)()
    ], MailConfigService);
    return MailConfigService;
}());
exports.MailConfigService = MailConfigService;
