"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.GhillieModule = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_strategy_1 = require("../auth/strategies/jwt-auth.strategy");
var prisma_service_1 = require("../prisma/prisma.service");
var shared_1 = require("../shared");
var ghillie_service_1 = require("./services/ghillie.service");
var ghillie_acl_service_1 = require("./services/ghillie-acl.service");
var ghillie_controller_1 = require("./controllers/ghillie.controller");
var flag_ghillie_service_1 = require("../flags/services/flag-ghillie.service");
var flag_ghillie_controller_1 = require("../flags/controllers/flag-ghillie.controller");
var GhillieModule = /** @class */ (function () {
    function GhillieModule() {
    }
    GhillieModule = __decorate([
        (0, common_1.Module)({
            providers: [
                ghillie_service_1.GhillieService,
                flag_ghillie_service_1.FlagGhillieService,
                ghillie_acl_service_1.GhillieAclService,
                jwt_auth_strategy_1.JwtAuthStrategy,
                prisma_service_1.PrismaService,
                shared_1.AppLogger,
            ],
            controllers: [ghillie_controller_1.GhillieController, flag_ghillie_controller_1.FlagGhillieController],
            exports: [ghillie_service_1.GhillieService, flag_ghillie_service_1.FlagGhillieService]
        })
    ], GhillieModule);
    return GhillieModule;
}());
exports.GhillieModule = GhillieModule;
