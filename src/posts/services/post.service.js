"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.PostService = void 0;
var common_1 = require("@nestjs/common");
var shared_1 = require("../../shared");
var post_detail_dto_1 = require("../dtos/post-detail.dto");
var client_1 = require("@prisma/client");
var crypto_1 = require("crypto");
var class_transformer_1 = require("class-transformer");
var post_listing_dto_1 = require("../dtos/post-listing.dto");
var PostService = /** @class */ (function () {
    function PostService(prisma, logger, postAclService) {
        this.prisma = prisma;
        this.logger = logger;
        this.postAclService = postAclService;
        this.logger.setContext(PostService_1.name);
    }
    PostService_1 = PostService;
    // Create Post
    PostService.prototype.createPost = function (ctx, postDto) {
        return __awaiter(this, void 0, void 0, function () {
            var ghillieUser, actor, isAllowed, post, dto;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.createPost.name, " was called"));
                        return [4 /*yield*/, this.prisma.ghillieMembers.findFirst({
                                where: {
                                    AND: [{ userId: ctx.user.id }, { ghillieId: postDto.ghillieId }]
                                },
                                include: {
                                    ghillie: true,
                                    user: true
                                }
                            })];
                    case 1:
                        ghillieUser = _a.sent();
                        if (!ghillieUser) {
                            throw new Error('You are not a member of this Ghillie');
                        }
                        if (ghillieUser.role !== client_1.GhillieRole.OWNER &&
                            ghillieUser.memberStatus !== client_1.MemberStatus.ACTIVE) {
                            throw new Error('You are not allowed to post to this Ghillie');
                        }
                        actor = ctx.user;
                        isAllowed = this.postAclService
                            .forActor(actor)
                            .canDoAction(shared_1.Action.Create);
                        if (!isAllowed) {
                            throw new common_1.UnauthorizedException('You are not allowed to create a post in this ghillie');
                        }
                        return [4 /*yield*/, this.prisma.$transaction(function (prisma) { return __awaiter(_this, void 0, void 0, function () {
                                var tags;
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            tags = [];
                                            if (!postDto.postTagNames) return [3 /*break*/, 2];
                                            return [4 /*yield*/, Promise.all(postDto.postTagNames.map(function (tagName) { return __awaiter(_this, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        return [2 /*return*/, prisma.postTag.upsert({
                                                                where: {
                                                                    name: tagName
                                                                },
                                                                update: {},
                                                                create: {
                                                                    name: tagName
                                                                }
                                                            })];
                                                    });
                                                }); }))];
                                        case 1:
                                            tags = _a.sent();
                                            _a.label = 2;
                                        case 2: return [4 /*yield*/, prisma.post.create({
                                                data: {
                                                    uid: (0, crypto_1.randomUUID)(),
                                                    title: postDto.title,
                                                    content: postDto.content,
                                                    ghillieId: postDto.ghillieId,
                                                    postedById: ctx.user.id,
                                                    tags: {
                                                        connect: tags.map(function (tag) { return ({
                                                            id: tag.id
                                                        }); })
                                                    }
                                                },
                                                include: {
                                                    tags: true,
                                                    postedBy: true,
                                                    ghillie: true,
                                                    _count: {
                                                        select: {
                                                            postComments: true,
                                                            postReaction: true
                                                        }
                                                    }
                                                }
                                            })];
                                        case 3: 
                                        // create the post
                                        return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); })];
                    case 2:
                        post = _a.sent();
                        dto = (0, class_transformer_1.plainToInstance)(post_detail_dto_1.PostDetailDto, post, {
                            excludeExtraneousValues: true,
                            enableImplicitConversion: true
                        });
                        dto.tags = post.tags.map(function (tag) { return tag.name; });
                        return [2 /*return*/, dto];
                }
            });
        });
    };
    PostService.prototype.updatePost = function (ctx, id, postDto) {
        return __awaiter(this, void 0, void 0, function () {
            var foundPost, ghillieUser, actor, isAllowed, updatedPost, dto;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.updatePost.name, " was called"));
                        return [4 /*yield*/, this.prisma.post.findFirst({
                                where: {
                                    id: id
                                },
                                include: {
                                    ghillie: true
                                }
                            })];
                    case 1:
                        foundPost = _a.sent();
                        if (!foundPost) {
                            throw new common_1.NotFoundException('Post not found');
                        }
                        return [4 /*yield*/, this.prisma.ghillieMembers.findFirst({
                                where: {
                                    AND: [{ userId: ctx.user.id }, { ghillieId: foundPost.ghillieId }]
                                }
                            })];
                    case 2:
                        ghillieUser = _a.sent();
                        if (!ghillieUser) {
                            throw new Error('You are not a member of this Ghillie');
                        }
                        if (ghillieUser.memberStatus !== client_1.MemberStatus.ACTIVE) {
                            throw new Error('You are not allowed to post to this Ghillie');
                        }
                        actor = ctx.user;
                        isAllowed = this.postAclService
                            .forActor(actor)
                            .canDoAction(shared_1.Action.Update, foundPost);
                        if (!isAllowed) {
                            throw new common_1.UnauthorizedException('You are not authorized to update this post');
                        }
                        return [4 /*yield*/, this.prisma.$transaction(function (prisma) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (postDto.content !== undefined) {
                                                foundPost.content = postDto.content;
                                            }
                                            if (postDto.status !== undefined) {
                                                foundPost.status = postDto.status;
                                            }
                                            return [4 /*yield*/, prisma.post.update({
                                                    where: {
                                                        id: id
                                                    },
                                                    data: {
                                                        content: foundPost.content,
                                                        status: foundPost.status,
                                                        edited: true
                                                    },
                                                    include: {
                                                        ghillie: true,
                                                        postedBy: true,
                                                        tags: true,
                                                        _count: {
                                                            select: {
                                                                postComments: true,
                                                                postReaction: true
                                                            }
                                                        },
                                                        postReaction: {
                                                            where: {
                                                                createdById: ctx.user.id
                                                            }
                                                        }
                                                    }
                                                })];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); })];
                    case 3:
                        updatedPost = _a.sent();
                        dto = (0, class_transformer_1.plainToInstance)(post_detail_dto_1.PostDetailDto, updatedPost, {
                            excludeExtraneousValues: true,
                            enableImplicitConversion: true
                        });
                        dto.tags = updatedPost.tags.map(function (tag) { return tag.name; });
                        return [2 /*return*/, dto];
                }
            });
        });
    };
    PostService.prototype.getPostById = function (ctx, id) {
        return __awaiter(this, void 0, void 0, function () {
            var post, ghillieUser, dto;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.getPostById.name, " was called"));
                        return [4 /*yield*/, this.prisma.post.findFirst({
                                where: {
                                    id: id
                                },
                                include: {
                                    ghillie: true,
                                    postedBy: true,
                                    tags: true,
                                    _count: {
                                        select: {
                                            postComments: true,
                                            postReaction: true
                                        }
                                    },
                                    postReaction: {
                                        where: {
                                            createdById: ctx.user.id
                                        }
                                    }
                                }
                            })];
                    case 1:
                        post = _a.sent();
                        if (!post) {
                            throw new common_1.NotFoundException('Post not found');
                        }
                        return [4 /*yield*/, this.prisma.ghillieMembers.findFirst({
                                where: {
                                    AND: [{ userId: ctx.user.id }, { ghillieId: post.ghillieId }]
                                }
                            })];
                    case 2:
                        ghillieUser = _a.sent();
                        if (!ghillieUser) {
                            throw new Error('You are not a member of this Ghillie');
                        }
                        if (ghillieUser.memberStatus !== client_1.MemberStatus.ACTIVE) {
                            throw new Error('You are not allowed to view posts in this Ghillie');
                        }
                        dto = (0, class_transformer_1.plainToInstance)(post_detail_dto_1.PostDetailDto, post, {
                            excludeExtraneousValues: true,
                            enableImplicitConversion: true
                        });
                        dto.tags = post.tags.map(function (tag) { return tag.name; });
                        return [2 /*return*/, dto];
                }
            });
        });
    };
    // todo: this would probably be better with elasticsearch in the future
    PostService.prototype.getAllPosts = function (ctx, criteria) {
        return __awaiter(this, void 0, void 0, function () {
            var ghillieUser, where, _a, posts, count, mappedPost;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.getAllPosts.name, " was called"));
                        return [4 /*yield*/, this.prisma.ghillieMembers.findFirst({
                                where: {
                                    AND: [{ userId: ctx.user.id }, { ghillieId: criteria.ghillieId }]
                                }
                            })];
                    case 1:
                        ghillieUser = _b.sent();
                        if (!ghillieUser) {
                            throw new Error('You are not a member of this Ghillie');
                        }
                        if (ghillieUser.memberStatus !== client_1.MemberStatus.ACTIVE) {
                            throw new Error('You are not allowed to view posts in this Ghillie');
                        }
                        where = { AND: [] };
                        if (criteria.title) {
                            where.AND.push({
                                title: { contains: criteria.title, mode: 'insensitive' }
                            });
                        }
                        if (criteria.content) {
                            where.AND.push({
                                content: { contains: criteria.content, mode: 'insensitive' }
                            });
                        }
                        if (criteria.status) {
                            where.AND.push({ status: criteria.status });
                        }
                        if (criteria.tags) {
                            where.AND.push({
                                tags: {
                                    some: {
                                        id: {
                                            "in": criteria.tags
                                        }
                                    }
                                }
                            });
                        }
                        return [4 /*yield*/, this.prisma.$transaction([
                                this.prisma.post.findMany({
                                    where: __assign({}, where),
                                    take: criteria.limit,
                                    skip: criteria.offset,
                                    orderBy: {
                                        // newest first
                                        createdDate: 'desc'
                                    },
                                    include: {
                                        tags: true,
                                        postedBy: true,
                                        _count: {
                                            select: {
                                                postComments: true,
                                                postReaction: true
                                            }
                                        },
                                        postReaction: {
                                            where: {
                                                createdById: ctx.user.id
                                            }
                                        }
                                    }
                                }),
                                this.prisma.post.count({
                                    where: {
                                        AND: [{ status: client_1.PostStatus.ACTIVE }]
                                    }
                                }),
                            ])];
                    case 2:
                        _a = _b.sent(), posts = _a[0], count = _a[1];
                        mappedPost = (0, class_transformer_1.plainToInstance)(post_listing_dto_1.PostListingDto, posts, {
                            excludeExtraneousValues: true,
                            enableImplicitConversion: true
                        });
                        return [2 /*return*/, {
                                posts: mappedPost,
                                count: count
                            }];
                }
            });
        });
    };
    PostService.prototype.hardDeletePost = function (ctx, id) {
        return __awaiter(this, void 0, void 0, function () {
            var actor, isAllowed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.hardDeletePost.name, " was called"));
                        actor = ctx.user;
                        isAllowed = this.postAclService
                            .forActor(actor)
                            .canDoAction(shared_1.Action.Delete);
                        if (!isAllowed) {
                            throw new common_1.UnauthorizedException('You are not authorized to delete this post');
                        }
                        return [4 /*yield*/, this.prisma.post["delete"]({
                                where: {
                                    id: id
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PostService.prototype.getPostsForGhillie = function (ctx, ghillieId, take, cursor) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, findManyArgs, toConnection, posts, ghillieUser;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.getPostsForGhillie.name, " was called"));
                        _a = (0, shared_1.parsePaginationArgs)({
                            first: take - 1,
                            after: cursor ? cursor.id : undefined
                        }), findManyArgs = _a.findManyArgs, toConnection = _a.toConnection;
                        return [4 /*yield*/, this.prisma.post.findMany(__assign(__assign({}, findManyArgs), { where: {
                                    AND: [{ status: client_1.PostStatus.ACTIVE }, { ghillieId: ghillieId }]
                                }, orderBy: {
                                    createdDate: 'desc'
                                }, include: {
                                    tags: true,
                                    postedBy: true,
                                    ghillie: true,
                                    _count: {
                                        select: {
                                            postComments: true,
                                            postReaction: true
                                        }
                                    },
                                    postReaction: {
                                        where: {
                                            createdById: ctx.user.id
                                        }
                                    }
                                } }))];
                    case 1:
                        posts = _b.sent();
                        if (posts.length === 0) {
                            return [2 /*return*/, {
                                    posts: [],
                                    pageInfo: toConnection(posts).pageInfo
                                }];
                        }
                        return [4 /*yield*/, this.prisma.ghillieMembers.findFirst({
                                where: {
                                    AND: [{ userId: ctx.user.id }, { ghillieId: ghillieId }]
                                }
                            })];
                    case 2:
                        ghillieUser = _b.sent();
                        if (!ghillieUser) {
                            throw new Error('You are not a member of this Ghillie');
                        }
                        if (ghillieUser.memberStatus !== client_1.MemberStatus.ACTIVE) {
                            throw new Error('You are not allowed to view posts in this Ghillie');
                        }
                        return [2 /*return*/, {
                                posts: (0, class_transformer_1.plainToInstance)(post_listing_dto_1.PostListingDto, posts, {
                                    excludeExtraneousValues: true,
                                    enableImplicitConversion: true
                                }),
                                pageInfo: toConnection(posts).pageInfo
                            }];
                }
            });
        });
    };
    var PostService_1;
    PostService = PostService_1 = __decorate([
        (0, common_1.Injectable)()
    ], PostService);
    return PostService;
}());
exports.PostService = PostService;
