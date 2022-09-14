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
exports.GhillieService = void 0;
var common_1 = require("@nestjs/common");
var shared_1 = require("../../shared");
var client_1 = require("@prisma/client");
var slugify_1 = require("slugify");
var class_transformer_1 = require("class-transformer");
var ghillie_detail_dto_1 = require("../dtos/ghillie/ghillie-detail.dto");
var GhillieService = /** @class */ (function () {
    function GhillieService(prisma, logger, ghillieAclService) {
        this.prisma = prisma;
        this.logger = logger;
        this.ghillieAclService = ghillieAclService;
        this.logger.setContext(GhillieService_1.name);
    }
    GhillieService_1 = GhillieService;
    GhillieService.prototype.createGhillie = function (ctx, createGhillieDto) {
        return __awaiter(this, void 0, void 0, function () {
            var actor, isAllowed, ghillie;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.createGhillie.name, " was called"));
                        actor = ctx.user;
                        isAllowed = this.ghillieAclService
                            .forActor(actor)
                            .canDoAction(shared_1.Action.Create);
                        if (!isAllowed) {
                            throw new common_1.UnauthorizedException('You are not allowed to create a ghillie');
                        }
                        return [4 /*yield*/, this.prisma.$transaction(function (prisma) { return __awaiter(_this, void 0, void 0, function () {
                                var topics, ghillie;
                                var _this = this;
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            topics = [];
                                            if (!createGhillieDto.topicNames) return [3 /*break*/, 2];
                                            return [4 /*yield*/, Promise.all((_a = createGhillieDto.topicNames) === null || _a === void 0 ? void 0 : _a.map(function (topicName) { return __awaiter(_this, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0: return [4 /*yield*/, prisma.topic.upsert({
                                                                    where: {
                                                                        name: topicName
                                                                    },
                                                                    update: {},
                                                                    create: {
                                                                        name: topicName,
                                                                        slug: (0, slugify_1["default"])(topicName, {
                                                                            replacement: '-',
                                                                            lower: true,
                                                                            strict: true,
                                                                            trim: true
                                                                        }),
                                                                        createdByUserId: ctx.user.id
                                                                    }
                                                                })];
                                                            case 1: return [2 /*return*/, _a.sent()];
                                                        }
                                                    });
                                                }); }))];
                                        case 1:
                                            topics = _b.sent();
                                            _b.label = 2;
                                        case 2: return [4 /*yield*/, prisma.ghillie.create({
                                                data: {
                                                    name: createGhillieDto.name,
                                                    slug: (0, slugify_1["default"])(createGhillieDto.name, {
                                                        replacement: '-',
                                                        lower: true,
                                                        strict: true,
                                                        trim: true
                                                    }),
                                                    about: createGhillieDto.about,
                                                    createdByUserId: ctx.user.id,
                                                    readOnly: createGhillieDto.readOnly,
                                                    imageUrl: createGhillieDto.imageUrl,
                                                    topics: {
                                                        connect: topics.map(function (topic) { return ({
                                                            id: topic.id
                                                        }); })
                                                    }
                                                },
                                                include: {
                                                    topics: true,
                                                    _count: {
                                                        select: {
                                                            members: true
                                                        }
                                                    },
                                                    members: {
                                                        where: {
                                                            userId: ctx.user.id
                                                        }
                                                    }
                                                }
                                            })];
                                        case 3:
                                            ghillie = _b.sent();
                                            // Create a ghillie member for the owner
                                            return [4 /*yield*/, prisma.ghillieMembers.create({
                                                    data: {
                                                        ghillieId: ghillie.id,
                                                        userId: ctx.user.id,
                                                        role: client_1.GhillieRole.OWNER,
                                                        joinDate: new Date(),
                                                        memberStatus: client_1.MemberStatus.ACTIVE
                                                    }
                                                })];
                                        case 4:
                                            // Create a ghillie member for the owner
                                            _b.sent();
                                            return [2 /*return*/, ghillie];
                                    }
                                });
                            }); })];
                    case 1:
                        ghillie = _a.sent();
                        return [2 /*return*/, (0, class_transformer_1.plainToInstance)(ghillie_detail_dto_1.GhillieDetailDto, ghillie, {
                                excludeExtraneousValues: true,
                                enableImplicitConversion: true
                            })];
                }
            });
        });
    };
    GhillieService.prototype.getGhillie = function (ctx, id) {
        return __awaiter(this, void 0, void 0, function () {
            var actor, isAllowed, ghillie, totalMembers, ghillieDetail;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.getGhillie.name, " was called"));
                        actor = ctx.user;
                        isAllowed = this.ghillieAclService
                            .forActor(actor)
                            .canDoAction(shared_1.Action.Read);
                        if (!isAllowed) {
                            throw new common_1.UnauthorizedException('You are not allowed to view a ghillie');
                        }
                        return [4 /*yield*/, this.prisma.ghillie.findFirst({
                                where: {
                                    AND: [{ id: id }, { status: client_1.GhillieStatus.ACTIVE }]
                                },
                                include: {
                                    topics: true,
                                    _count: {
                                        select: {
                                            members: true
                                        }
                                    },
                                    members: {
                                        where: {
                                            userId: ctx.user.id
                                        }
                                    }
                                }
                            })];
                    case 1:
                        ghillie = _a.sent();
                        if (!ghillie) {
                            throw new common_1.NotFoundException('Ghillie not found or is not active');
                        }
                        return [4 /*yield*/, this.prisma.ghillieMembers.count({
                                where: {
                                    ghillieId: id
                                }
                            })];
                    case 2:
                        totalMembers = _a.sent();
                        ghillieDetail = (0, class_transformer_1.plainToInstance)(ghillie_detail_dto_1.GhillieDetailDto, ghillie, {
                            excludeExtraneousValues: true,
                            enableImplicitConversion: true
                        });
                        ghillieDetail.totalMembers = totalMembers;
                        return [2 /*return*/, ghillieDetail];
                }
            });
        });
    };
    GhillieService.prototype.getGhillies = function (ctx, query) {
        return __awaiter(this, void 0, void 0, function () {
            var actor, isAllowed, where, _a, ghillies, count, convertedGhillies;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.getGhillies.name, " was called"));
                        actor = ctx.user;
                        isAllowed = this.ghillieAclService
                            .forActor(actor)
                            .canDoAction(shared_1.Action.Read);
                        if (!isAllowed) {
                            throw new common_1.UnauthorizedException('You are not allowed to view Ghillies');
                        }
                        where = { AND: [] };
                        if (query.name) {
                            where.AND.push({ name: { contains: query.name, mode: 'insensitive' } });
                        }
                        if (query.readonly) {
                            where.AND.push({ readOnly: query.readonly });
                        }
                        if (query.about) {
                            where.AND.push({ about: { contains: query.about, mode: 'insensitive' } });
                        }
                        if (query.status) {
                            where.AND.push({ status: query.status });
                        }
                        if (query.topicIds) {
                            where.AND.push({
                                topics: {
                                    some: {
                                        id: {
                                            "in": query.topicIds
                                        }
                                    }
                                }
                            });
                        }
                        return [4 /*yield*/, this.prisma.$transaction([
                                this.prisma.ghillie.findMany({
                                    where: __assign({}, where),
                                    take: query.limit,
                                    skip: query.offset,
                                    include: {
                                        topics: true,
                                        _count: {
                                            select: {
                                                members: true
                                            }
                                        },
                                        members: {
                                            where: {
                                                userId: ctx.user.id
                                            }
                                        }
                                    }
                                }),
                                this.prisma.ghillie.count({
                                    where: {
                                        AND: [{ status: client_1.GhillieStatus.ACTIVE }]
                                    }
                                }),
                            ])];
                    case 1:
                        _a = _b.sent(), ghillies = _a[0], count = _a[1];
                        convertedGhillies = (0, class_transformer_1.plainToInstance)(ghillie_detail_dto_1.GhillieDetailDto, ghillies, {
                            excludeExtraneousValues: true,
                            enableImplicitConversion: true
                        });
                        return [2 /*return*/, {
                                ghillies: convertedGhillies,
                                count: count
                            }];
                }
            });
        });
    };
    GhillieService.prototype.updateGhillie = function (ctx, id, updateGhillieDto) {
        return __awaiter(this, void 0, void 0, function () {
            var ghillieUser, actor, isAllowed, updatedGhillie;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.updateGhillie.name, " was called"));
                        ghillieUser = this.prisma.ghillieMembers.findFirst({
                            where: {
                                AND: [{ ghillieId: id }, { userId: ctx.user.id }]
                            }
                        });
                        if (!ghillieUser) {
                            throw new common_1.UnauthorizedException('You are not allowed to update this ghillie');
                        }
                        actor = ctx.user;
                        isAllowed = this.ghillieAclService
                            .forActor(actor)
                            .canDoAction(shared_1.Action.Update, ghillieUser);
                        if (!isAllowed) {
                            throw new common_1.UnauthorizedException('You are not authorized to update this ghillie');
                        }
                        return [4 /*yield*/, this.prisma.$transaction(function (prisma) { return __awaiter(_this, void 0, void 0, function () {
                                var ghillie, topics, topicsToRemove;
                                var _this = this;
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, prisma.ghillie.findUnique({
                                                where: {
                                                    id: id
                                                },
                                                include: {
                                                    topics: true
                                                }
                                            })];
                                        case 1:
                                            ghillie = _b.sent();
                                            if (!ghillie) {
                                                throw new common_1.NotFoundException('Ghillie not found');
                                            }
                                            return [4 /*yield*/, Promise.all((_a = updateGhillieDto.topicNames) === null || _a === void 0 ? void 0 : _a.map(function (topicName) { return __awaiter(_this, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0: return [4 /*yield*/, prisma.topic.upsert({
                                                                    where: {
                                                                        name: topicName
                                                                    },
                                                                    update: {},
                                                                    create: {
                                                                        name: topicName,
                                                                        slug: (0, slugify_1["default"])(topicName, {
                                                                            replacement: '-',
                                                                            lower: true,
                                                                            strict: true,
                                                                            trim: true
                                                                        }),
                                                                        createdByUserId: ctx.user.id
                                                                    }
                                                                })];
                                                            case 1: return [2 /*return*/, _a.sent()];
                                                        }
                                                    });
                                                }); }))];
                                        case 2:
                                            topics = _b.sent();
                                            if (updateGhillieDto.readOnly !== undefined) {
                                                ghillie.readOnly = updateGhillieDto.readOnly;
                                            }
                                            if (updateGhillieDto.name !== undefined) {
                                                ghillie.name = updateGhillieDto.name;
                                                ghillie.slug = (0, slugify_1["default"])(updateGhillieDto.name, {
                                                    replacement: '-',
                                                    lower: true,
                                                    strict: true,
                                                    trim: true
                                                });
                                            }
                                            if (updateGhillieDto.about !== undefined) {
                                                ghillie.about = updateGhillieDto.about;
                                            }
                                            if (updateGhillieDto.imageUrl !== undefined) {
                                                ghillie.imageUrl = updateGhillieDto.imageUrl;
                                            }
                                            topicsToRemove = ghillie.topics.filter(function (topic) {
                                                return !updateGhillieDto.topicNames.includes(topic.name);
                                            });
                                            return [4 /*yield*/, prisma.ghillie.update({
                                                    where: { id: id },
                                                    data: __assign(__assign({}, ghillie), { topics: {
                                                            connect: topics.map(function (topic) { return ({
                                                                id: topic.id
                                                            }); }),
                                                            disconnect: topicsToRemove.map(function (topic) {
                                                                return { id: topic.id };
                                                            })
                                                        } }),
                                                    include: {
                                                        topics: true,
                                                        _count: {
                                                            select: {
                                                                members: true
                                                            }
                                                        },
                                                        members: {
                                                            where: {
                                                                userId: ctx.user.id
                                                            }
                                                        }
                                                    }
                                                })];
                                        case 3: return [2 /*return*/, _b.sent()];
                                    }
                                });
                            }); })];
                    case 1:
                        updatedGhillie = _a.sent();
                        return [2 /*return*/, (0, class_transformer_1.plainToInstance)(ghillie_detail_dto_1.GhillieDetailDto, updatedGhillie, {
                                excludeExtraneousValues: true,
                                enableImplicitConversion: true
                            })];
                }
            });
        });
    };
    GhillieService.prototype.deleteGhillie = function (ctx, id) {
        return __awaiter(this, void 0, void 0, function () {
            var ghillieUser, actor, isAllowed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.deleteGhillie.name, " was called"));
                        ghillieUser = this.prisma.ghillieMembers.findFirst({
                            where: {
                                AND: [{ ghillieId: id }, { userId: ctx.user.id }]
                            }
                        });
                        if (!ghillieUser) {
                            throw new common_1.UnauthorizedException('You are not allowed to delete this ghillie');
                        }
                        actor = ctx.user;
                        isAllowed = this.ghillieAclService
                            .forActor(actor)
                            .canDoAction(shared_1.Action.Delete, ghillieUser);
                        if (!isAllowed) {
                            throw new common_1.UnauthorizedException('You are not authorized to delete this ghillie');
                        }
                        return [4 /*yield*/, this.prisma.ghillie["delete"]({
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
    GhillieService.prototype.joinGhillie = function (ctx, id) {
        return __awaiter(this, void 0, void 0, function () {
            var ghillie, ghillieMember;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.joinGhillie.name, " was called"));
                        return [4 /*yield*/, this.prisma.ghillie.findUnique({
                                where: {
                                    id: id
                                }
                            })];
                    case 1:
                        ghillie = _a.sent();
                        if (!ghillie) {
                            throw new common_1.NotFoundException('Ghillie not found');
                        }
                        if (ghillie.status !== client_1.GhillieStatus.ACTIVE) {
                            throw new common_1.BadRequestException('Ghillie is not join-able at this time');
                        }
                        return [4 /*yield*/, this.prisma.ghillieMembers.upsert({
                                where: {
                                    userId_ghillieId: {
                                        userId: ctx.user.id,
                                        ghillieId: id
                                    }
                                },
                                update: {},
                                create: {
                                    ghillieId: id,
                                    userId: ctx.user.id,
                                    joinDate: new Date(),
                                    memberStatus: client_1.MemberStatus.ACTIVE,
                                    role: client_1.GhillieRole.MEMBER
                                }
                            })];
                    case 2:
                        ghillieMember = _a.sent();
                        if (ghillieMember.memberStatus === client_1.MemberStatus.SUSPENDED) {
                            throw new common_1.UnauthorizedException('You have been suspended from this ghillie');
                        }
                        if (ghillieMember.memberStatus === client_1.MemberStatus.BANNED) {
                            throw new common_1.UnauthorizedException('You have been banned from this ghillie');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    GhillieService.prototype.leaveGhillie = function (ctx, id) {
        return __awaiter(this, void 0, void 0, function () {
            var ghillie, ghillieMember;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.leaveGhillie.name, " was called"));
                        return [4 /*yield*/, this.prisma.ghillie.findUnique({
                                where: {
                                    id: id
                                }
                            })];
                    case 1:
                        ghillie = _a.sent();
                        if (!ghillie) {
                            throw new common_1.NotFoundException('Ghillie not found');
                        }
                        if (ghillie.status !== client_1.GhillieStatus.ACTIVE) {
                            throw new common_1.BadRequestException('Ghillie is not join-able at this time');
                        }
                        return [4 /*yield*/, this.prisma.ghillieMembers.findFirst({
                                where: {
                                    AND: [{ userId: ctx.user.id }, { ghillieId: id }]
                                }
                            })];
                    case 2:
                        ghillieMember = _a.sent();
                        if (!ghillieMember) {
                            throw new common_1.NotFoundException('You are not a member of this ghillie');
                        }
                        if (ghillieMember.memberStatus === client_1.MemberStatus.SUSPENDED) {
                            throw new common_1.UnauthorizedException('You have been suspended from this ghillie');
                        }
                        if (ghillieMember.memberStatus === client_1.MemberStatus.BANNED) {
                            throw new common_1.UnauthorizedException('You have been banned from this ghillie');
                        }
                        if (ghillieMember.role === client_1.GhillieRole.OWNER) {
                            throw new common_1.BadRequestException('You cannot leave a Ghillie you own. Please transfer ownership first.');
                        }
                        return [4 /*yield*/, this.prisma.ghillieMembers["delete"]({
                                where: {
                                    userId_ghillieId: {
                                        userId: ctx.user.id,
                                        ghillieId: id
                                    }
                                }
                            })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GhillieService.prototype.transferOwnership = function (ctx, id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var transferToUser, ghillie, ghillieMember, actor, isAllowed;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.user.findFirst({
                            where: {
                                AND: [
                                    { id: userId },
                                    { activated: true }, // Must be an activated account
                                ]
                            }
                        })];
                    case 1:
                        transferToUser = _a.sent();
                        if (!transferToUser) {
                            throw new common_1.NotFoundException('Invalid User Id provided');
                        }
                        return [4 /*yield*/, this.prisma.ghillie.findUnique({
                                where: {
                                    id: id
                                }
                            })];
                    case 2:
                        ghillie = _a.sent();
                        if (!ghillie) {
                            throw new common_1.NotFoundException('Ghillie not found');
                        }
                        return [4 /*yield*/, this.prisma.ghillieMembers.findFirst({
                                where: {
                                    AND: [{ userId: ctx.user.id }, { ghillieId: id }]
                                }
                            })];
                    case 3:
                        ghillieMember = _a.sent();
                        actor = ctx.user;
                        isAllowed = this.ghillieAclService
                            .forActor(actor)
                            .canDoAction(shared_1.Action.GhillieManage, ghillieMember);
                        if (!isAllowed) {
                            throw new common_1.UnauthorizedException("You're not allowed to transfer ownership of this ghillie");
                        }
                        return [4 /*yield*/, this.prisma.$transaction(function (prisma) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: 
                                        // Do the transfer to the new
                                        return [4 /*yield*/, prisma.ghillieMembers.upsert({
                                                where: {
                                                    userId_ghillieId: {
                                                        userId: userId,
                                                        ghillieId: id
                                                    }
                                                },
                                                update: {
                                                    role: client_1.GhillieRole.OWNER
                                                },
                                                create: {
                                                    ghillieId: id,
                                                    userId: userId,
                                                    joinDate: new Date(),
                                                    memberStatus: client_1.MemberStatus.ACTIVE,
                                                    role: client_1.GhillieRole.OWNER
                                                }
                                            })];
                                        case 1:
                                            // Do the transfer to the new
                                            _a.sent();
                                            // Make existing owner a member
                                            return [4 /*yield*/, prisma.ghillieMembers.update({
                                                    where: {
                                                        userId_ghillieId: {
                                                            userId: ctx.user.id,
                                                            ghillieId: id
                                                        }
                                                    },
                                                    data: {
                                                        role: client_1.GhillieRole.MEMBER
                                                    }
                                                })];
                                        case 2:
                                            // Make existing owner a member
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GhillieService.prototype.addModerator = function (ctx, id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var newModeratorUser, ghillie, ghillieMember, actor, isAllowed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.user.findFirst({
                            where: {
                                AND: [
                                    { id: userId },
                                    { activated: true }, // Must be an activated account
                                ]
                            }
                        })];
                    case 1:
                        newModeratorUser = _a.sent();
                        if (!newModeratorUser) {
                            throw new common_1.NotFoundException('Invalid User Id provided');
                        }
                        return [4 /*yield*/, this.prisma.ghillie.findUnique({
                                where: {
                                    id: id
                                }
                            })];
                    case 2:
                        ghillie = _a.sent();
                        if (!ghillie) {
                            throw new common_1.NotFoundException('Ghillie not found');
                        }
                        return [4 /*yield*/, this.prisma.ghillieMembers.findFirst({
                                where: {
                                    AND: [{ userId: ctx.user.id }, { ghillieId: id }]
                                }
                            })];
                    case 3:
                        ghillieMember = _a.sent();
                        actor = ctx.user;
                        isAllowed = this.ghillieAclService
                            .forActor(actor)
                            .canDoAction(shared_1.Action.GhillieManage, ghillieMember);
                        if (!isAllowed) {
                            throw new common_1.UnauthorizedException("You're not allowed to add moderators to this ghillie");
                        }
                        return [4 /*yield*/, this.prisma.ghillieMembers.upsert({
                                where: {
                                    userId_ghillieId: {
                                        userId: userId,
                                        ghillieId: id
                                    }
                                },
                                update: {
                                    role: client_1.GhillieRole.MODERATOR
                                },
                                create: {
                                    ghillieId: id,
                                    userId: userId,
                                    joinDate: new Date(),
                                    memberStatus: client_1.MemberStatus.ACTIVE,
                                    role: client_1.GhillieRole.MODERATOR
                                }
                            })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GhillieService.prototype.removeModerator = function (ctx, id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var removeModeratorUser, ghillie, ghillieMember, actor, isAllowed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.user.findFirst({
                            where: {
                                AND: [
                                    { id: userId },
                                    { activated: true }, // Must be an activated account
                                ]
                            }
                        })];
                    case 1:
                        removeModeratorUser = _a.sent();
                        if (!removeModeratorUser) {
                            throw new common_1.NotFoundException('Invalid User Id provided');
                        }
                        return [4 /*yield*/, this.prisma.ghillie.findUnique({
                                where: {
                                    id: id
                                }
                            })];
                    case 2:
                        ghillie = _a.sent();
                        if (!ghillie) {
                            throw new common_1.NotFoundException('Ghillie not found');
                        }
                        return [4 /*yield*/, this.prisma.ghillieMembers.findFirst({
                                where: {
                                    AND: [{ userId: ctx.user.id }, { ghillieId: id }]
                                }
                            })];
                    case 3:
                        ghillieMember = _a.sent();
                        actor = ctx.user;
                        isAllowed = this.ghillieAclService
                            .forActor(actor)
                            .canDoAction(shared_1.Action.GhillieManage, ghillieMember);
                        if (!isAllowed) {
                            throw new common_1.UnauthorizedException("You're not allowed to add moderators to this ghillie");
                        }
                        return [4 /*yield*/, this.prisma.ghillieMembers.update({
                                where: {
                                    userId_ghillieId: {
                                        userId: userId,
                                        ghillieId: id
                                    }
                                },
                                data: {
                                    role: client_1.GhillieRole.MEMBER
                                }
                            })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GhillieService.prototype.banUser = function (ctx, id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var banUser, ghillie, ghillieMember, actor, isAllowed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.user.findFirst({
                            where: {
                                AND: [
                                    { id: userId },
                                    { activated: true }, // Must be an activated account
                                ]
                            }
                        })];
                    case 1:
                        banUser = _a.sent();
                        if (!banUser) {
                            throw new common_1.NotFoundException('Invalid User Id provided');
                        }
                        return [4 /*yield*/, this.prisma.ghillie.findUnique({
                                where: {
                                    id: id
                                }
                            })];
                    case 2:
                        ghillie = _a.sent();
                        if (!ghillie) {
                            throw new common_1.NotFoundException('Ghillie not found');
                        }
                        return [4 /*yield*/, this.prisma.ghillieMembers.findFirst({
                                where: {
                                    AND: [{ userId: ctx.user.id }, { ghillieId: id }]
                                }
                            })];
                    case 3:
                        ghillieMember = _a.sent();
                        actor = ctx.user;
                        isAllowed = this.ghillieAclService
                            .forActor(actor)
                            .canDoAction(shared_1.Action.GhillieModerator, ghillieMember);
                        if (!isAllowed) {
                            throw new common_1.UnauthorizedException("You're not allowed to moderate users from this ghillie");
                        }
                        return [4 /*yield*/, this.prisma.ghillieMembers.update({
                                where: {
                                    userId_ghillieId: {
                                        userId: userId,
                                        ghillieId: id
                                    }
                                },
                                data: {
                                    memberStatus: client_1.MemberStatus.BANNED
                                }
                            })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GhillieService.prototype.unbanUser = function (ctx, id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var unbanUser, ghillie, ghillieMember, actor, isAllowed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.user.findFirst({
                            where: {
                                AND: [
                                    { id: userId },
                                    { activated: true }, // Must be an activated account
                                ]
                            }
                        })];
                    case 1:
                        unbanUser = _a.sent();
                        if (!unbanUser) {
                            throw new common_1.NotFoundException('Invalid User Id provided');
                        }
                        return [4 /*yield*/, this.prisma.ghillie.findUnique({
                                where: {
                                    id: id
                                }
                            })];
                    case 2:
                        ghillie = _a.sent();
                        if (!ghillie) {
                            throw new common_1.NotFoundException('Ghillie not found');
                        }
                        return [4 /*yield*/, this.prisma.ghillieMembers.findFirst({
                                where: {
                                    AND: [{ userId: ctx.user.id }, { ghillieId: id }]
                                }
                            })];
                    case 3:
                        ghillieMember = _a.sent();
                        actor = ctx.user;
                        isAllowed = this.ghillieAclService
                            .forActor(actor)
                            .canDoAction(shared_1.Action.GhillieModerator, ghillieMember);
                        if (!isAllowed) {
                            throw new common_1.UnauthorizedException("You're not allowed to moderate users from this ghillie");
                        }
                        return [4 /*yield*/, this.prisma.ghillieMembers.update({
                                where: {
                                    userId_ghillieId: {
                                        userId: userId,
                                        ghillieId: id
                                    }
                                },
                                data: {
                                    memberStatus: client_1.MemberStatus.ACTIVE
                                }
                            })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GhillieService.prototype.addTopics = function (ctx, id, topicNames) {
        return __awaiter(this, void 0, void 0, function () {
            var foundGhillie, ghillieMember, actor, isAllowed, ghillie;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.ghillie.findUnique({
                            where: {
                                id: id
                            }
                        })];
                    case 1:
                        foundGhillie = _a.sent();
                        if (!foundGhillie) {
                            throw new common_1.NotFoundException('Ghillie not found');
                        }
                        return [4 /*yield*/, this.prisma.ghillieMembers.findFirst({
                                where: {
                                    AND: [{ userId: ctx.user.id }, { ghillieId: id }]
                                }
                            })];
                    case 2:
                        ghillieMember = _a.sent();
                        actor = ctx.user;
                        isAllowed = this.ghillieAclService
                            .forActor(actor)
                            .canDoAction(shared_1.Action.GhillieManage, ghillieMember);
                        if (!isAllowed) {
                            throw new common_1.UnauthorizedException("You're not allowed to add topics to this ghillie");
                        }
                        return [4 /*yield*/, this.prisma.$transaction(function (prisma) { return __awaiter(_this, void 0, void 0, function () {
                                var topics;
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, Promise.all(topicNames === null || topicNames === void 0 ? void 0 : topicNames.map(function (topicName) { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0: return [4 /*yield*/, prisma.topic.upsert({
                                                                where: {
                                                                    name: topicName
                                                                },
                                                                update: {},
                                                                create: {
                                                                    name: topicName,
                                                                    slug: (0, slugify_1["default"])(topicName, {
                                                                        replacement: '-',
                                                                        lower: true,
                                                                        strict: true,
                                                                        trim: true
                                                                    }),
                                                                    createdByUserId: ctx.user.id
                                                                }
                                                            })];
                                                        case 1: return [2 /*return*/, _a.sent()];
                                                    }
                                                });
                                            }); }))];
                                        case 1:
                                            topics = _a.sent();
                                            return [4 /*yield*/, prisma.ghillie.update({
                                                    where: { id: id },
                                                    data: __assign(__assign({}, foundGhillie), { topics: {
                                                            connect: topics.map(function (topic) { return ({
                                                                id: topic.id
                                                            }); })
                                                        } }),
                                                    include: {
                                                        topics: true,
                                                        _count: {
                                                            select: {
                                                                members: true
                                                            }
                                                        },
                                                        members: {
                                                            where: {
                                                                userId: ctx.user.id
                                                            }
                                                        }
                                                    }
                                                })];
                                        case 2: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); })];
                    case 3:
                        ghillie = _a.sent();
                        return [2 /*return*/, (0, class_transformer_1.plainToInstance)(ghillie_detail_dto_1.GhillieDetailDto, ghillie, {
                                excludeExtraneousValues: true,
                                enableImplicitConversion: true
                            })];
                }
            });
        });
    };
    GhillieService.prototype.removeTopics = function (ctx, id, topicIds) {
        return __awaiter(this, void 0, void 0, function () {
            var foundGhillie, ghillieMember, actor, isAllowed, ghillie;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.ghillie.findUnique({
                            where: {
                                id: id
                            }
                        })];
                    case 1:
                        foundGhillie = _a.sent();
                        if (!foundGhillie) {
                            throw new common_1.NotFoundException('Ghillie not found');
                        }
                        return [4 /*yield*/, this.prisma.ghillieMembers.findFirst({
                                where: {
                                    AND: [{ userId: ctx.user.id }, { ghillieId: id }]
                                }
                            })];
                    case 2:
                        ghillieMember = _a.sent();
                        actor = ctx.user;
                        isAllowed = this.ghillieAclService
                            .forActor(actor)
                            .canDoAction(shared_1.Action.GhillieManage, ghillieMember);
                        if (!isAllowed) {
                            throw new common_1.UnauthorizedException("You're not allowed to add topics to this ghillie");
                        }
                        return [4 /*yield*/, this.prisma.ghillie.update({
                                where: { id: id },
                                data: __assign(__assign({}, foundGhillie), { topics: {
                                        deleteMany: {
                                            id: {
                                                "in": topicIds
                                            }
                                        }
                                    } }),
                                include: {
                                    topics: true,
                                    _count: {
                                        select: {
                                            members: true
                                        }
                                    },
                                    members: {
                                        where: {
                                            userId: ctx.user.id
                                        }
                                    }
                                }
                            })];
                    case 3:
                        ghillie = _a.sent();
                        return [2 /*return*/, (0, class_transformer_1.plainToInstance)(ghillie_detail_dto_1.GhillieDetailDto, ghillie, {
                                excludeExtraneousValues: true,
                                enableImplicitConversion: true
                            })];
                }
            });
        });
    };
    GhillieService.prototype.getGhilliesForCurrentUser = function (ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var ghillies;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.ghillie.findMany({
                            where: {
                                status: {
                                    equals: client_1.GhillieStatus.ACTIVE
                                },
                                members: {
                                    some: {
                                        userId: ctx.user.id,
                                        memberStatus: client_1.MemberStatus.ACTIVE
                                    }
                                }
                            }
                        })];
                    case 1:
                        ghillies = _a.sent();
                        return [2 /*return*/, (0, class_transformer_1.plainToInstance)(ghillie_detail_dto_1.GhillieDetailDto, ghillies, {
                                excludeExtraneousValues: true,
                                enableImplicitConversion: true
                            })];
                }
            });
        });
    };
    var GhillieService_1;
    GhillieService = GhillieService_1 = __decorate([
        (0, common_1.Injectable)()
    ], GhillieService);
    return GhillieService;
}());
exports.GhillieService = GhillieService;
