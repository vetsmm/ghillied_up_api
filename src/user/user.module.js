"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.UserModule = void 0;
var common_1 = require("@nestjs/common");
var user_service_1 = require("./services/user.service");
var jwt_auth_strategy_1 = require("../auth/strategies/jwt-auth.strategy");
var user_controller_1 = require("./controllers/user.controller");
var prisma_service_1 = require("../prisma/prisma.service");
var config_1 = require("@nestjs/config");
var shared_1 = require("../shared");
var user_acl_service_1 = require("./services/user-acl.service");
var anonymous_user_controller_1 = require("./controllers/anonymous-user.controller");
var UserModule = /** @class */ (function () {
    function UserModule() {
    }
    UserModule = __decorate([
        (0, common_1.Module)({
            providers: [
                user_service_1.UserService,
                jwt_auth_strategy_1.JwtAuthStrategy,
                prisma_service_1.PrismaService,
                shared_1.AppLogger,
                config_1.ConfigService,
                user_acl_service_1.UserAclService,
            ],
            controllers: [user_controller_1.UserController, anonymous_user_controller_1.AnonymousUserController],
            exports: [user_service_1.UserService]
        })
    ], UserModule);
    return UserModule;
}());
exports.UserModule = UserModule;
