"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.PostsModule = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_strategy_1 = require("../auth/strategies/jwt-auth.strategy");
var prisma_service_1 = require("../prisma/prisma.service");
var shared_1 = require("../shared");
var post_acl_service_1 = require("./services/post-acl.service");
var post_service_1 = require("./services/post.service");
var post_controller_1 = require("./controllers/post.controller");
var post_reaction_service_1 = require("./services/post-reaction.service");
var post_reaction_acl_service_1 = require("./services/post-reaction-acl.service");
var post_reaction_controller_1 = require("./controllers/post-reaction.controller");
var post_comment_service_1 = require("./services/post-comment.service");
var post_comment_controller_1 = require("./controllers/post-comment.controller");
var post_comment_acl_service_1 = require("./services/post-comment-acl.service");
var comment_reaction_controller_1 = require("./controllers/comment-reaction.controller");
var post_comment_reaction_service_1 = require("./services/post-comment-reaction.service");
var PostsModule = /** @class */ (function () {
    function PostsModule() {
    }
    PostsModule = __decorate([
        (0, common_1.Module)({
            providers: [
                jwt_auth_strategy_1.JwtAuthStrategy,
                prisma_service_1.PrismaService,
                shared_1.AppLogger,
                post_acl_service_1.PostAclService,
                post_service_1.PostService,
                post_reaction_service_1.PostReactionService,
                post_reaction_acl_service_1.PostReactionAclService,
                post_comment_acl_service_1.PostCommentAclService,
                post_comment_service_1.PostCommentService,
                post_comment_reaction_service_1.PostCommentReactionService,
            ],
            controllers: [
                post_controller_1.PostController,
                post_reaction_controller_1.PostReactionController,
                post_comment_controller_1.PostCommentController,
                comment_reaction_controller_1.CommentReactionController,
            ],
            exports: [post_service_1.PostService, post_reaction_service_1.PostReactionService, post_comment_service_1.PostCommentService]
        })
    ], PostsModule);
    return PostsModule;
}());
exports.PostsModule = PostsModule;
