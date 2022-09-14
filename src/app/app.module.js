"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AppModule = void 0;
var common_1 = require("@nestjs/common");
var app_controller_1 = require("./app.controller");
var app_service_1 = require("./app.service");
var auth_module_1 = require("../auth/auth.module");
var user_module_1 = require("../user/user.module");
var prisma_module_1 = require("../prisma/prisma.module");
var core_1 = require("@nestjs/core");
var ghillies_module_1 = require("../ghillie/ghillies.module");
var posts_module_1 = require("../posts/posts.module");
var post_feed_module_1 = require("../post-feed/post-feed.module");
var flags_module_1 = require("../flags/flags.module");
var shared_1 = require("../shared");
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        (0, common_1.Module)({
            imports: [
                auth_module_1.AuthModule,
                user_module_1.UserModule,
                prisma_module_1.PrismaModule,
                shared_1.SharedModule,
                ghillies_module_1.GhillieModule,
                posts_module_1.PostsModule,
                post_feed_module_1.PostFeedModule,
                flags_module_1.FlagsModule,
            ],
            controllers: [app_controller_1.AppController],
            providers: [
                app_service_1.AppService,
                { provide: core_1.APP_INTERCEPTOR, useClass: shared_1.LoggingInterceptor },
                {
                    provide: core_1.APP_FILTER,
                    useClass: shared_1.AllExceptionsFilter
                },
            ]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
