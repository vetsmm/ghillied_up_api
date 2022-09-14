"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.FlagsModule = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_strategy_1 = require("../auth/strategies/jwt-auth.strategy");
var prisma_service_1 = require("../prisma/prisma.service");
var shared_1 = require("../shared");
var flag_ghillie_service_1 = require("./services/flag-ghillie.service");
var flag_ghillie_controller_1 = require("./controllers/flag-ghillie.controller");
var flag_post_service_1 = require("./services/flag-post.service");
var flag_post_controller_1 = require("./controllers/flag-post.controller");
var flag_comment_controller_1 = require("./controllers/flag-comment.controller");
var flag_comment_service_1 = require("./services/flag-comment.service");
var FlagsModule = /** @class */ (function () {
    function FlagsModule() {
    }
    FlagsModule = __decorate([
        (0, common_1.Module)({
            providers: [
                flag_ghillie_service_1.FlagGhillieService,
                flag_post_service_1.FlagPostService,
                flag_comment_service_1.FlagCommentService,
                jwt_auth_strategy_1.JwtAuthStrategy,
                prisma_service_1.PrismaService,
                shared_1.AppLogger,
            ],
            controllers: [
                flag_ghillie_controller_1.FlagGhillieController,
                flag_post_controller_1.FlagPostController,
                flag_comment_controller_1.FlagCommentController,
            ],
            exports: [flag_ghillie_service_1.FlagGhillieService, flag_post_service_1.FlagPostService, flag_comment_service_1.FlagCommentService]
        })
    ], FlagsModule);
    return FlagsModule;
}());
exports.FlagsModule = FlagsModule;
