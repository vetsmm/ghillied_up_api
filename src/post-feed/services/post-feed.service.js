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
exports.PostFeedService = void 0;
var common_1 = require("@nestjs/common");
var shared_1 = require("../../shared");
var post_listing_dto_1 = require("../../posts/dtos/post-listing.dto");
var class_transformer_1 = require("class-transformer");
var client_1 = require("@prisma/client");
// TODO: we are coming in this with the naive solution first
// of having no caching or any performance improvements
var PostFeedService = /** @class */ (function () {
    function PostFeedService(prisma, logger, feedAclService) {
        this.prisma = prisma;
        this.logger = logger;
        this.feedAclService = feedAclService;
        this.logger.setContext(PostFeedService_1.name);
    }
    PostFeedService_1 = PostFeedService;
    PostFeedService.prototype.getFeed = function (ctx, body) {
        return __awaiter(this, void 0, void 0, function () {
            var where, _a, findManyArgs, toConnection, posts;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.getFeed.name, " was called"));
                        where = this.generatePrismaWhereQuery(body.filters);
                        _a = (0, shared_1.parsePaginationArgs)({
                            first: body.take - 1,
                            after: body.cursor ? body.cursor : undefined
                        }), findManyArgs = _a.findManyArgs, toConnection = _a.toConnection;
                        return [4 /*yield*/, this.prisma.post.findMany(__assign(__assign(__assign({}, findManyArgs), where), { orderBy: {
                                    createdDate: body.orderBy
                                }, include: {
                                    tags: true,
                                    postedBy: true,
                                    // only posts in ghillies user is a member of
                                    ghillie: {
                                        include: {
                                            members: {
                                                where: {
                                                    userId: ctx.user.id,
                                                    memberStatus: client_1.MemberStatus.ACTIVE
                                                }
                                            }
                                        }
                                    },
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
    PostFeedService.prototype.generatePrismaWhereQuery = function (query) {
        // Take all the keys in the object, and generate a where clause with AND for each key
        // e.g. { id: { equals: 1 } } => { where: { id: { equals: 1 } } }
        if (query === undefined || Object.keys(query).length === 0) {
            return null;
        }
        var where = { AND: [] };
        Object.keys(query).forEach(function (key) {
            var _a;
            where.AND.push((_a = {}, _a[key] = query[key], _a));
        });
        return { where: where };
    };
    var PostFeedService_1;
    PostFeedService = PostFeedService_1 = __decorate([
        (0, common_1.Injectable)()
    ], PostFeedService);
    return PostFeedService;
}());
exports.PostFeedService = PostFeedService;
