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
exports.PostReactionService = void 0;
var common_1 = require("@nestjs/common");
var shared_1 = require("../../shared");
var client_1 = require("@prisma/client");
var class_transformer_1 = require("class-transformer");
var PostReactionService = /** @class */ (function () {
    function PostReactionService(prisma, logger, postAclService, postService) {
        this.prisma = prisma;
        this.logger = logger;
        this.postAclService = postAclService;
        this.postService = postService;
        this.logger.setContext(PostReactionService_1.name);
    }
    PostReactionService_1 = PostReactionService;
    PostReactionService.prototype.reactToPost = function (ctx, reactionInput) {
        return __awaiter(this, void 0, void 0, function () {
            var post, member, reaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.reactToPost.name, " was called"));
                        return [4 /*yield*/, this.prisma.post.findUnique({
                                where: {
                                    id: reactionInput.postId
                                }
                            })];
                    case 1:
                        post = _a.sent();
                        if (!post) {
                            throw new Error("The post with id ".concat(reactionInput.postId, " does not exist. Please enter the correct post id."));
                        }
                        return [4 /*yield*/, this.prisma.ghillieMembers.findFirst({
                                where: {
                                    ghillieId: post.ghillieId,
                                    userId: ctx.user.id,
                                    memberStatus: client_1.MemberStatus.ACTIVE
                                }
                            })];
                    case 2:
                        member = _a.sent();
                        if (!member) {
                            throw new Error("You do not have access to to react to this post.");
                        }
                        if (!reactionInput.reactionType) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.prisma.postReaction.upsert({
                                where: {
                                    createdById_postId: {
                                        postId: reactionInput.postId,
                                        createdById: ctx.user.id
                                    }
                                },
                                create: {
                                    postId: reactionInput.postId,
                                    createdById: ctx.user.id,
                                    reactionType: reactionInput.reactionType
                                },
                                update: {
                                    reactionType: reactionInput.reactionType
                                }
                            })];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 4: return [4 /*yield*/, this.prisma.postReaction.findFirst({
                            where: {
                                postId: reactionInput.postId,
                                createdById: ctx.user.id
                            }
                        })];
                    case 5:
                        reaction = _a.sent();
                        if (!reaction) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.prisma.postReaction["delete"]({
                                where: {
                                    createdById_postId: {
                                        postId: reactionInput.postId,
                                        createdById: ctx.user.id
                                    }
                                }
                            })];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [2 /*return*/, this.postService.getPostById(ctx, reactionInput.postId)];
                }
            });
        });
    };
    PostReactionService.prototype.getAllPostReactions = function (ctx, postId, cursor, take) {
        if (take === void 0) { take = 25; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, findManyArgs, toConnection, reactions;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.getAllPostReactions.name, " was called"));
                        _a = (0, shared_1.parsePaginationArgs)({
                            first: take - 1,
                            after: cursor ? cursor : undefined
                        }), findManyArgs = _a.findManyArgs, toConnection = _a.toConnection;
                        return [4 /*yield*/, this.prisma.postReaction.findMany(__assign(__assign({}, findManyArgs), { where: {
                                    postId: postId
                                }, include: {
                                    post: true
                                } }))];
                    case 1:
                        reactions = _b.sent();
                        if (reactions.length === 0) {
                            return [2 /*return*/, {
                                    reactions: [],
                                    pageInfo: toConnection(reactions).pageInfo
                                }];
                        }
                        return [2 /*return*/, {
                                reactions: (0, class_transformer_1.plainToInstance)(shared_1.PostReactionDetailsDto, reactions, {
                                    excludeExtraneousValues: true,
                                    enableImplicitConversion: true
                                }),
                                pageInfo: toConnection(reactions).pageInfo
                            }];
                }
            });
        });
    };
    PostReactionService.prototype.getCurrentUserReactions = function (ctx, postId, cursor, take) {
        if (take === void 0) { take = 25; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, findManyArgs, toConnection, reactions;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.getCurrentUserReactions.name, " was called"));
                        _a = (0, shared_1.parsePaginationArgs)({
                            first: take - 1,
                            after: cursor ? cursor : undefined
                        }), findManyArgs = _a.findManyArgs, toConnection = _a.toConnection;
                        return [4 /*yield*/, this.prisma.postReaction.findMany(__assign(__assign({}, findManyArgs), { where: {
                                    postId: postId,
                                    createdById: ctx.user.id
                                }, include: {
                                    post: {
                                        include: {
                                            ghillie: true,
                                            postedBy: true
                                        }
                                    }
                                } }))];
                    case 1:
                        reactions = _b.sent();
                        if (reactions.length === 0) {
                            return [2 /*return*/, {
                                    reactions: [],
                                    pageInfo: toConnection(reactions).pageInfo
                                }];
                        }
                        return [2 /*return*/, {
                                reactions: (0, class_transformer_1.plainToInstance)(shared_1.PostReactionDetailsDto, reactions, {
                                    excludeExtraneousValues: true,
                                    enableImplicitConversion: true
                                }),
                                pageInfo: toConnection(reactions).pageInfo
                            }];
                }
            });
        });
    };
    PostReactionService.prototype.getPostReactionsCount = function (ctx, postId) {
        return __awaiter(this, void 0, void 0, function () {
            var post, reactionCounts, totalReactions, reactions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.getCurrentUserReactions.name, " was called"));
                        return [4 /*yield*/, this.prisma.post.findUnique({
                                where: {
                                    id: postId
                                },
                                include: {
                                    ghillie: true,
                                    postedBy: true
                                }
                            })];
                    case 1:
                        post = _a.sent();
                        if (!post) {
                            throw new Error("The post with id ".concat(postId, " does not exist. Please enter the correct post id."));
                        }
                        return [4 /*yield*/, this.prisma.postReaction.groupBy({
                                by: ['reactionType'],
                                where: {
                                    postId: postId
                                },
                                _count: true
                            })];
                    case 2:
                        reactionCounts = _a.sent();
                        totalReactions = reactionCounts
                            .map(function (reaction) { return reaction._count; })
                            .reduce(function (a, b) { return a + b; }, 0);
                        reactions = reactionCounts.map(function (reaction) {
                            var _a;
                            return _a = {}, _a[reaction.reactionType] = reaction._count, _a;
                        });
                        return [2 /*return*/, {
                                totalReactions: totalReactions,
                                reactions: reactions,
                                postId: post.id,
                                post: (0, class_transformer_1.plainToInstance)(shared_1.PostDetailDto, post, {
                                    excludeExtraneousValues: true,
                                    enableImplicitConversion: true
                                })
                            }];
                }
            });
        });
    };
    var PostReactionService_1;
    PostReactionService = PostReactionService_1 = __decorate([
        (0, common_1.Injectable)()
    ], PostReactionService);
    return PostReactionService;
}());
exports.PostReactionService = PostReactionService;
