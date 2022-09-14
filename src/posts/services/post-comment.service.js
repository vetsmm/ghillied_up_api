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
exports.PostCommentService = void 0;
var common_1 = require("@nestjs/common");
var shared_1 = require("../../shared");
var client_1 = require("@prisma/client");
var class_transformer_1 = require("class-transformer");
var PostCommentService = /** @class */ (function () {
    function PostCommentService(prisma, logger, aclService) {
        this.prisma = prisma;
        this.logger = logger;
        this.aclService = aclService;
        this.logger.setContext(PostCommentService_1.name);
    }
    PostCommentService_1 = PostCommentService;
    PostCommentService.prototype.createPostComment = function (ctx, createPostCommentInput) {
        return __awaiter(this, void 0, void 0, function () {
            var actor, isAllowed, ghillieMember, comment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.createPostComment.name, " was called"));
                        actor = ctx.user;
                        isAllowed = this.aclService
                            .forActor(actor)
                            .canDoAction(shared_1.Action.Create);
                        if (!isAllowed) {
                            throw new common_1.UnauthorizedException('You are not allowed to create comments in this Ghillie');
                        }
                        return [4 /*yield*/, this.prisma.ghillieMembers.findFirst({
                                where: {
                                    ghillie: {
                                        posts: {
                                            some: {
                                                id: createPostCommentInput.postId
                                            }
                                        }
                                    },
                                    userId: ctx.user.id,
                                    memberStatus: client_1.MemberStatus.ACTIVE
                                }
                            })];
                    case 1:
                        ghillieMember = _a.sent();
                        if (!ghillieMember) {
                            throw new Error('User is not a member of the ghillie and cannot comment on this post');
                        }
                        if (!createPostCommentInput.parentCommentId) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.createChildComment(ctx, createPostCommentInput)];
                    case 2:
                        comment = _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.createParentComment(ctx, createPostCommentInput)];
                    case 4:
                        comment = _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, (0, class_transformer_1.plainToInstance)(shared_1.CommentDetailDto, comment, {
                            excludeExtraneousValues: true,
                            enableImplicitConversion: true
                        })];
                }
            });
        });
    };
    PostCommentService.prototype.getTopLevelPostComments = function (ctx, postId, take, cursor) {
        return __awaiter(this, void 0, void 0, function () {
            var actor, isAllowed, ghillieMember, _a, findManyArgs, toConnection, toResponse, postComments;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.getTopLevelPostComments.name, " was called"));
                        actor = ctx.user;
                        isAllowed = this.aclService.forActor(actor).canDoAction(shared_1.Action.Read);
                        if (!isAllowed) {
                            throw new common_1.UnauthorizedException('You are not allowed to view comments');
                        }
                        return [4 /*yield*/, this.prisma.ghillieMembers.findFirst({
                                where: {
                                    ghillie: {
                                        posts: {
                                            some: {
                                                id: postId
                                            }
                                        }
                                    }
                                }
                            })];
                    case 1:
                        ghillieMember = _b.sent();
                        if (!ghillieMember) {
                            throw new Error('User is not a member of the ghillie and cannot view comments on this post');
                        }
                        _a = (0, shared_1.parsePaginationArgs)({
                            first: take - 1,
                            after: cursor ? cursor : null
                        }), findManyArgs = _a.findManyArgs, toConnection = _a.toConnection, toResponse = _a.toResponse;
                        return [4 /*yield*/, this.prisma.postComment.findMany(__assign(__assign({}, findManyArgs), { where: {
                                    AND: [
                                        { postId: postId },
                                        { status: client_1.CommentStatus.ACTIVE },
                                        { commentHeight: 0 },
                                    ]
                                }, orderBy: {
                                    // Todo: order by depth
                                    createdDate: 'asc'
                                }, include: {
                                    createdBy: true,
                                    _count: {
                                        select: {
                                            commentReaction: true
                                        }
                                    },
                                    commentReaction: {
                                        where: {
                                            createdById: ctx.user.id
                                        }
                                    }
                                } }))];
                    case 2:
                        postComments = _b.sent();
                        return [2 /*return*/, {
                                comments: (0, class_transformer_1.plainToInstance)(shared_1.CommentDetailDto, toResponse(postComments), {
                                    excludeExtraneousValues: true,
                                    enableImplicitConversion: true
                                }),
                                pageInfo: toConnection(postComments).pageInfo
                            }];
                }
            });
        });
    };
    PostCommentService.prototype.getPostCommentsChildrenByIds = function (ctx, commentIds) {
        return __awaiter(this, void 0, void 0, function () {
            var actor, isAllowed, postComments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.getPostCommentsChildrenByIds.name, " was called"));
                        actor = ctx.user;
                        isAllowed = this.aclService.forActor(actor).canDoAction(shared_1.Action.Read);
                        if (!isAllowed) {
                            throw new common_1.UnauthorizedException('You are not allowed to view comments');
                        }
                        return [4 /*yield*/, this.prisma.postComment.findMany({
                                where: {
                                    id: {
                                        "in": commentIds.commentIds
                                    },
                                    commentHeight: commentIds.height
                                },
                                include: {
                                    createdBy: true,
                                    _count: {
                                        select: {
                                            commentReaction: true
                                        }
                                    },
                                    commentReaction: {
                                        where: {
                                            createdById: ctx.user.id
                                        }
                                    }
                                }
                            })];
                    case 1:
                        postComments = _a.sent();
                        return [2 /*return*/, (0, class_transformer_1.plainToInstance)(shared_1.CommentDetailDto, postComments, {
                                excludeExtraneousValues: true,
                                enableImplicitConversion: true
                            })];
                }
            });
        });
    };
    PostCommentService.prototype.updatePostComment = function (ctx, commentId, updatePostCommentInput) {
        return __awaiter(this, void 0, void 0, function () {
            var comment, actor, isAllowed, updatedComment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.updatePostComment.name, " was called"));
                        return [4 /*yield*/, this.prisma.postComment.findFirst({
                                where: {
                                    id: commentId
                                }
                            })];
                    case 1:
                        comment = _a.sent();
                        if (!comment) {
                            throw new Error('Comment does not exist.');
                        }
                        actor = ctx.user;
                        isAllowed = this.aclService
                            .forActor(actor)
                            .canDoAction(shared_1.Action.Update, comment);
                        if (!isAllowed) {
                            throw new common_1.UnauthorizedException('You are not allowed to update this comment');
                        }
                        updatedComment = this.prisma.postComment.update({
                            where: {
                                id: commentId
                            },
                            data: {
                                content: updatePostCommentInput.content || comment.content,
                                status: updatePostCommentInput.status || comment.status,
                                edited: true
                            },
                            include: {
                                createdBy: true,
                                _count: {
                                    select: {
                                        commentReaction: true
                                    }
                                },
                                commentReaction: {
                                    where: {
                                        createdById: ctx.user.id
                                    }
                                }
                            }
                        });
                        return [2 /*return*/, (0, class_transformer_1.plainToInstance)(shared_1.CommentDetailDto, updatedComment, {
                                excludeExtraneousValues: true,
                                enableImplicitConversion: true
                            })];
                }
            });
        });
    };
    PostCommentService.prototype.createParentComment = function (ctx, createPostCommentInput) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.logger.log(ctx, "".concat(this.createParentComment.name, " was called"));
                return [2 /*return*/, this.prisma.postComment.create({
                        data: {
                            content: createPostCommentInput.content,
                            postId: createPostCommentInput.postId,
                            createdById: ctx.user.id,
                            createdDate: new Date(),
                            status: client_1.CommentStatus.ACTIVE
                        },
                        include: {
                            commentReaction: {
                                where: {
                                    createdById: ctx.user.id
                                }
                            }
                        }
                    })];
            });
        });
    };
    PostCommentService.prototype.createChildComment = function (ctx, createPostCommentInput) {
        return __awaiter(this, void 0, void 0, function () {
            var parentComment;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.createChildComment.name, " was called"));
                        return [4 /*yield*/, this.prisma.postComment.findFirst({
                                where: {
                                    id: createPostCommentInput.parentCommentId
                                }
                            })];
                    case 1:
                        parentComment = _a.sent();
                        if (!parentComment) {
                            throw new Error('Parent comment does not exist.');
                        }
                        if (parentComment.commentHeight >= 2) {
                            throw new Error('Maximum comment depth reached.');
                        }
                        return [4 /*yield*/, this.prisma.$transaction(function (prisma) { return __awaiter(_this, void 0, void 0, function () {
                                var comment;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, prisma.postComment.create({
                                                data: {
                                                    content: createPostCommentInput.content,
                                                    postId: createPostCommentInput.postId,
                                                    createdById: ctx.user.id,
                                                    createdDate: new Date(),
                                                    status: client_1.CommentStatus.ACTIVE,
                                                    // Get the parent comment's commentHeight and add 1
                                                    commentHeight: parentComment.commentHeight + 1
                                                },
                                                include: {
                                                    commentReaction: {
                                                        where: {
                                                            createdById: ctx.user.id
                                                        }
                                                    }
                                                }
                                            })];
                                        case 1:
                                            comment = _a.sent();
                                            // Update the parent comment to include the child comment
                                            return [4 /*yield*/, prisma.postComment.update({
                                                    where: {
                                                        id: createPostCommentInput.parentCommentId
                                                    },
                                                    data: {
                                                        childCommentIds: {
                                                            push: comment.id
                                                        }
                                                    }
                                                })];
                                        case 2:
                                            // Update the parent comment to include the child comment
                                            _a.sent();
                                            return [2 /*return*/, comment];
                                    }
                                });
                            }); })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // delete comment and all children based on the childCommentIds
    PostCommentService.prototype.deletePostComment = function (ctx, commentId) {
        return __awaiter(this, void 0, void 0, function () {
            var actor, isAllowed, comment;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.deletePostComment.name, " was called"));
                        actor = ctx.user;
                        isAllowed = this.aclService
                            .forActor(actor)
                            .canDoAction(shared_1.Action.Delete);
                        if (!isAllowed) {
                            throw new common_1.UnauthorizedException('You are not allowed to delete a comment in this ghillie');
                        }
                        return [4 /*yield*/, this.prisma.postComment.findFirst({
                                where: {
                                    id: commentId
                                }
                            })];
                    case 1:
                        comment = _a.sent();
                        if (!comment) {
                            throw new Error('Comment does not exist');
                        }
                        // delete all children
                        return [4 /*yield*/, this.prisma.$transaction(function (prisma) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, prisma.postComment.deleteMany({
                                                where: {
                                                    id: {
                                                        "in": comment.childCommentIds
                                                    }
                                                }
                                            })];
                                        case 1:
                                            _a.sent();
                                            // delete the parent comment
                                            return [4 /*yield*/, prisma.postComment["delete"]({
                                                    where: {
                                                        id: commentId
                                                    }
                                                })];
                                        case 2:
                                            // delete the parent comment
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        // delete all children
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PostCommentService.prototype.getAllChildrenByLevel = function (ctx, id, level) {
        return __awaiter(this, void 0, void 0, function () {
            var actor, isAllowed, comment, comments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.createChildComment.name, " was called"));
                        actor = ctx.user;
                        isAllowed = this.aclService.forActor(actor).canDoAction(shared_1.Action.Read);
                        if (!isAllowed) {
                            throw new common_1.UnauthorizedException('You are not allowed to view comments');
                        }
                        if (level >= 2) {
                            throw new Error('Comment depth cannot exceed 1. Possible choices are 0-1.');
                        }
                        return [4 /*yield*/, this.prisma.postComment.findUnique({
                                where: {
                                    id: id
                                }
                            })];
                    case 1:
                        comment = _a.sent();
                        if (!comment) {
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, this.prisma.postComment.findMany({
                                where: {
                                    commentHeight: level,
                                    id: {
                                        "in": comment.childCommentIds
                                    }
                                },
                                include: {
                                    createdBy: true,
                                    _count: {
                                        select: {
                                            commentReaction: true
                                        }
                                    },
                                    commentReaction: {
                                        where: {
                                            createdById: ctx.user.id
                                        }
                                    }
                                }
                            })];
                    case 2:
                        comments = _a.sent();
                        return [2 /*return*/, (0, class_transformer_1.plainToInstance)(shared_1.CommentDetailDto, comments, {
                                excludeExtraneousValues: true,
                                enableImplicitConversion: true
                            })];
                }
            });
        });
    };
    var PostCommentService_1;
    PostCommentService = PostCommentService_1 = __decorate([
        (0, common_1.Injectable)()
    ], PostCommentService);
    return PostCommentService;
}());
exports.PostCommentService = PostCommentService;
