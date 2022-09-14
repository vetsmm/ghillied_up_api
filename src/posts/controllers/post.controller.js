"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.PostController = void 0;
var swagger_1 = require("@nestjs/swagger");
var common_1 = require("@nestjs/common");
var shared_1 = require("../../shared");
var jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
var authorities_guard_1 = require("../../auth/guards/authorities.guard");
var authority_decorator_1 = require("../../auth/decorators/authority.decorator");
var client_1 = require("@prisma/client");
var post_detail_dto_1 = require("../dtos/post-detail.dto");
var post_listing_dto_1 = require("../dtos/post-listing.dto");
var PostController = /** @class */ (function () {
    function PostController(logger, postService) {
        this.logger = logger;
        this.postService = postService;
        this.logger.setContext(PostController_1.name);
    }
    PostController_1 = PostController;
    // create post
    PostController.prototype.createPost = function (ctx, postDto) {
        return __awaiter(this, void 0, void 0, function () {
            var post;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.createPost.name, " was called"));
                        return [4 /*yield*/, this.postService.createPost(ctx, postDto)];
                    case 1:
                        post = _a.sent();
                        return [2 /*return*/, {
                                data: post,
                                meta: {}
                            }];
                }
            });
        });
    };
    // update post
    PostController.prototype.updatePost = function (ctx, id, postDto) {
        return __awaiter(this, void 0, void 0, function () {
            var post;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.updatePost.name, " was called"));
                        return [4 /*yield*/, this.postService.updatePost(ctx, id, postDto)];
                    case 1:
                        post = _a.sent();
                        return [2 /*return*/, {
                                data: post,
                                meta: {}
                            }];
                }
            });
        });
    };
    // get post by id
    PostController.prototype.getPostById = function (ctx, id) {
        return __awaiter(this, void 0, void 0, function () {
            var post;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.getPostById.name, " was called"));
                        return [4 /*yield*/, this.postService.getPostById(ctx, id)];
                    case 1:
                        post = _a.sent();
                        return [2 /*return*/, {
                                data: post,
                                meta: {}
                            }];
                }
            });
        });
    };
    // get all posts
    PostController.prototype.getPostsForGhillie = function (ctx, ghillieId, take, cursor) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, posts, pageInfo;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.getPostsForGhillie.name, " was called"));
                        return [4 /*yield*/, this.postService.getPostsForGhillie(ctx, ghillieId, take, cursor
                                ? {
                                    id: cursor
                                }
                                : undefined)];
                    case 1:
                        _a = _b.sent(), posts = _a.posts, pageInfo = _a.pageInfo;
                        return [2 /*return*/, {
                                data: posts,
                                meta: pageInfo
                            }];
                }
            });
        });
    };
    // get all posts
    PostController.prototype.getAllPosts = function (ctx, criteria) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, posts, count;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.getAllPosts.name, " was called"));
                        return [4 /*yield*/, this.postService.getAllPosts(ctx, criteria)];
                    case 1:
                        _a = _b.sent(), posts = _a.posts, count = _a.count;
                        return [2 /*return*/, {
                                data: posts,
                                meta: { count: count }
                            }];
                }
            });
        });
    };
    // delete post only by an admin
    PostController.prototype.deletePost = function (ctx, id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.deletePost.name, " was called"));
                        return [4 /*yield*/, this.postService.hardDeletePost(ctx, id)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    var PostController_1;
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, authorities_guard_1.AuthoritiesGuard),
        (0, swagger_1.ApiBearerAuth)(),
        (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
        (0, common_1.Post)(),
        (0, swagger_1.ApiOperation)({
            summary: 'Creates a new Post'
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.OK,
            type: (0, shared_1.SwaggerBaseApiResponse)(post_detail_dto_1.PostDetailDto)
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.NOT_FOUND,
            type: shared_1.BaseApiErrorResponse
        }),
        (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
        (0, authority_decorator_1.Authorities)(client_1.UserAuthority.ROLE_VERIFIED_MILITARY, client_1.UserAuthority.ROLE_USER),
        __param(0, (0, shared_1.ReqContext)()),
        __param(1, (0, common_1.Body)())
    ], PostController.prototype, "createPost");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, authorities_guard_1.AuthoritiesGuard),
        (0, swagger_1.ApiBearerAuth)(),
        (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
        (0, common_1.Patch)(':id'),
        (0, swagger_1.ApiOperation)({
            summary: 'Updates a Post'
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.OK,
            type: (0, shared_1.SwaggerBaseApiResponse)(post_detail_dto_1.PostDetailDto)
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.NOT_FOUND
        }),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        (0, authority_decorator_1.Authorities)(client_1.UserAuthority.ROLE_VERIFIED_MILITARY, client_1.UserAuthority.ROLE_USER),
        __param(0, (0, shared_1.ReqContext)()),
        __param(1, (0, common_1.Param)('id')),
        __param(2, (0, common_1.Body)())
    ], PostController.prototype, "updatePost");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, authorities_guard_1.AuthoritiesGuard),
        (0, swagger_1.ApiBearerAuth)(),
        (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
        (0, common_1.Get)(':id'),
        (0, swagger_1.ApiOperation)({
            summary: 'Gets a Post by id'
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.OK,
            type: (0, shared_1.SwaggerBaseApiResponse)(post_detail_dto_1.PostDetailDto)
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.NOT_FOUND
        }),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        (0, authority_decorator_1.Authorities)(client_1.UserAuthority.ROLE_USER, client_1.UserAuthority.ROLE_VERIFIED_MILITARY),
        __param(0, (0, shared_1.ReqContext)()),
        __param(1, (0, common_1.Param)('id'))
    ], PostController.prototype, "getPostById");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, authorities_guard_1.AuthoritiesGuard),
        (0, swagger_1.ApiBearerAuth)(),
        (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
        (0, common_1.Get)('for-ghillie/:ghillieId'),
        (0, swagger_1.ApiQuery)({
            name: 'cursor',
            type: String,
            description: 'Paging Cursor',
            required: false
        }),
        (0, swagger_1.ApiOperation)({
            summary: 'Gets all Posts for a ghillie'
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.OK,
            type: (0, shared_1.SwaggerBaseApiResponse)([post_listing_dto_1.PostListingDto])
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.BAD_REQUEST
        }),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        (0, authority_decorator_1.Authorities)(client_1.UserAuthority.ROLE_USER, client_1.UserAuthority.ROLE_VERIFIED_MILITARY),
        __param(0, (0, shared_1.ReqContext)()),
        __param(1, (0, common_1.Param)('ghillieId')),
        __param(2, (0, common_1.Query)('take', common_1.ParseIntPipe)),
        __param(3, (0, common_1.Query)('cursor'))
    ], PostController.prototype, "getPostsForGhillie");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, authorities_guard_1.AuthoritiesGuard),
        (0, swagger_1.ApiBearerAuth)(),
        (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
        (0, common_1.Post)('all'),
        (0, swagger_1.ApiOperation)({
            summary: 'Gets all Posts'
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.OK,
            type: (0, shared_1.SwaggerBaseApiResponse)([post_listing_dto_1.PostListingDto])
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.BAD_REQUEST
        }),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        (0, authority_decorator_1.Authorities)(client_1.UserAuthority.ROLE_USER, client_1.UserAuthority.ROLE_VERIFIED_MILITARY),
        __param(0, (0, shared_1.ReqContext)()),
        __param(1, (0, common_1.Body)())
    ], PostController.prototype, "getAllPosts");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, authorities_guard_1.AuthoritiesGuard),
        (0, swagger_1.ApiBearerAuth)(),
        (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
        (0, common_1.Delete)(':id'),
        (0, swagger_1.ApiOperation)({
            summary: 'Deletes a Post'
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.OK
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.NOT_FOUND
        }),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        (0, authority_decorator_1.Authorities)(client_1.UserAuthority.ROLE_ADMIN),
        __param(0, (0, shared_1.ReqContext)()),
        __param(1, (0, common_1.Param)('id'))
    ], PostController.prototype, "deletePost");
    PostController = PostController_1 = __decorate([
        (0, swagger_1.ApiTags)('posts'),
        (0, common_1.Controller)('posts')
    ], PostController);
    return PostController;
}());
exports.PostController = PostController;
