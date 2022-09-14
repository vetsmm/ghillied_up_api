"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.PostFeedModule = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_strategy_1 = require("../auth/strategies/jwt-auth.strategy");
var prisma_service_1 = require("../prisma/prisma.service");
var shared_1 = require("../shared");
var post_feed_acl_service_1 = require("./services/post-feed-acl.service");
var post_feed_controller_1 = require("./controllers/post-feed.controller");
var post_feed_service_1 = require("./services/post-feed.service");
var post_acl_service_1 = require("../posts/services/post-acl.service");
var PostFeedModule = /** @class */ (function () {
    function PostFeedModule() {
    }
    PostFeedModule = __decorate([
        (0, common_1.Module)({
            providers: [
                jwt_auth_strategy_1.JwtAuthStrategy,
                prisma_service_1.PrismaService,
                shared_1.AppLogger,
                post_feed_acl_service_1.PostFeedAclService,
                post_acl_service_1.PostAclService,
                post_feed_service_1.PostFeedService,
            ],
            controllers: [post_feed_controller_1.PostFeedController],
            exports: [post_feed_service_1.PostFeedService]
        })
    ], PostFeedModule);
    return PostFeedModule;
}());
exports.PostFeedModule = PostFeedModule;
