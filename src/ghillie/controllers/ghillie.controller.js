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
exports.GhillieController = void 0;
var swagger_1 = require("@nestjs/swagger");
var common_1 = require("@nestjs/common");
var shared_1 = require("../../shared");
var jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
var authorities_guard_1 = require("../../auth/guards/authorities.guard");
var ghillie_detail_dto_1 = require("../dtos/ghillie/ghillie-detail.dto");
var authority_decorator_1 = require("../../auth/decorators/authority.decorator");
var client_1 = require("@prisma/client");
var GhillieController = /** @class */ (function () {
    function GhillieController(logger, ghillieService) {
        this.logger = logger;
        this.ghillieService = ghillieService;
        this.logger.setContext(GhillieController_1.name);
    }
    GhillieController_1 = GhillieController;
    GhillieController.prototype.createGhillie = function (ctx, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createGhillieDto) {
        return __awaiter(this, void 0, void 0, function () {
            var ghillie;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.createGhillie.name, " was called"));
                        return [4 /*yield*/, this.ghillieService.createGhillie(ctx, createGhillieDto)];
                    case 1:
                        ghillie = _a.sent();
                        return [2 /*return*/, {
                                data: ghillie,
                                meta: {}
                            }];
                }
            });
        });
    };
    GhillieController.prototype.getGhillie = function (ctx, id) {
        return __awaiter(this, void 0, void 0, function () {
            var ghillie;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.getGhillie.name, " was called"));
                        return [4 /*yield*/, this.ghillieService.getGhillie(ctx, id)];
                    case 1:
                        ghillie = _a.sent();
                        return [2 /*return*/, {
                                data: ghillie,
                                meta: {}
                            }];
                }
            });
        });
    };
    GhillieController.prototype.getAllGhillies = function (ctx, query) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, ghillies, count;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.getAllGhillies.name, " was called"));
                        return [4 /*yield*/, this.ghillieService.getGhillies(ctx, {
                                limit: query.limit,
                                offset: query.offset
                            })];
                    case 1:
                        _a = _b.sent(), ghillies = _a.ghillies, count = _a.count;
                        return [2 /*return*/, {
                                data: ghillies,
                                meta: { count: count }
                            }];
                }
            });
        });
    };
    // Get ghillies for current user
    GhillieController.prototype.getCurrentUsersGhillies = function (ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var ghillies;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.getCurrentUsersGhillies.name, " was called"));
                        return [4 /*yield*/, this.ghillieService.getGhilliesForCurrentUser(ctx)];
                    case 1:
                        ghillies = _a.sent();
                        return [2 /*return*/, {
                                data: ghillies,
                                meta: {}
                            }];
                }
            });
        });
    };
    GhillieController.prototype.getAllGhilliesWithFilter = function (ctx, requestQuery) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, ghillies, count;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.getAllGhillies.name, " was called"));
                        return [4 /*yield*/, this.ghillieService.getGhillies(ctx, requestQuery)];
                    case 1:
                        _a = _b.sent(), ghillies = _a.ghillies, count = _a.count;
                        return [2 /*return*/, {
                                data: ghillies,
                                meta: { count: count }
                            }];
                }
            });
        });
    };
    GhillieController.prototype.updateGhillie = function (ctx, id, updateGhillieDto) {
        return __awaiter(this, void 0, void 0, function () {
            var ghillie;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.updateGhillie.name, " was called"));
                        return [4 /*yield*/, this.ghillieService.updateGhillie(ctx, id, updateGhillieDto)];
                    case 1:
                        ghillie = _a.sent();
                        return [2 /*return*/, {
                                data: ghillie,
                                meta: {}
                            }];
                }
            });
        });
    };
    GhillieController.prototype.deleteGhillie = function (ctx, id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.deleteGhillie.name, " was called"));
                        return [4 /*yield*/, this.ghillieService.deleteGhillie(ctx, id)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Join a Ghillie
    GhillieController.prototype.joinGhillie = function (ctx, id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.joinGhillie.name, " was called"));
                        return [4 /*yield*/, this.ghillieService.joinGhillie(ctx, id)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Leave a Ghillie
    GhillieController.prototype.leaveGhillie = function (ctx, id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.leaveGhillie.name, " was called"));
                        return [4 /*yield*/, this.ghillieService.leaveGhillie(ctx, id)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Transfer ownership of a Ghillie
    GhillieController.prototype.transferOwnership = function (ctx, id, transferOwnershipDto) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.transferOwnership.name, " was called"));
                        return [4 /*yield*/, this.ghillieService.transferOwnership(ctx, id, transferOwnershipDto.transferToUserId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Add Moderator Role to user
    GhillieController.prototype.addModerator = function (ctx, id, addModeratorDto) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.addModerator.name, " was called"));
                        return [4 /*yield*/, this.ghillieService.addModerator(ctx, id, addModeratorDto.userId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GhillieController.prototype.removeModerator = function (ctx, id, removeModeratorDto) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.removeModerator.name, " was called"));
                        return [4 /*yield*/, this.ghillieService.removeModerator(ctx, id, removeModeratorDto.userId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Ban a user from a Ghillie
    GhillieController.prototype.banUser = function (ctx, id, banUserDto) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.banUser.name, " was called"));
                        return [4 /*yield*/, this.ghillieService.banUser(ctx, id, banUserDto.userId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Unban a user from a Ghillie
    GhillieController.prototype.unbanUser = function (ctx, id, unbanUserDto) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.unbanUser.name, " was called"));
                        return [4 /*yield*/, this.ghillieService.unbanUser(ctx, id, unbanUserDto.userId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Add topics
    GhillieController.prototype.addTopics = function (ctx, id, addTopicsDto) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.addTopics.name, " was called"));
                        return [4 /*yield*/, this.ghillieService.addTopics(ctx, id, addTopicsDto.topicNames)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // Delete topics
    GhillieController.prototype.deleteTopics = function (ctx, id, deleteTopicsDto) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.addTopics.name, " was called"));
                        return [4 /*yield*/, this.ghillieService.removeTopics(ctx, id, deleteTopicsDto.topicIds)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    var GhillieController_1;
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, authorities_guard_1.AuthoritiesGuard),
        (0, swagger_1.ApiBearerAuth)(),
        (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
        (0, common_1.Post)(),
        (0, swagger_1.ApiOperation)({
            summary: 'Creates a new Ghillie'
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.OK,
            type: (0, shared_1.SwaggerBaseApiResponse)(ghillie_detail_dto_1.GhillieDetailDto)
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.NOT_FOUND,
            type: shared_1.BaseApiErrorResponse
        }),
        (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
        (0, authority_decorator_1.Authorities)(client_1.UserAuthority.ROLE_ADMIN),
        __param(0, (0, shared_1.ReqContext)()),
        __param(1, (0, common_1.Body)())
    ], GhillieController.prototype, "createGhillie");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, authorities_guard_1.AuthoritiesGuard),
        (0, authority_decorator_1.Authorities)(client_1.UserAuthority.ROLE_USER),
        (0, swagger_1.ApiBearerAuth)(),
        (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
        (0, common_1.Get)(':id'),
        (0, swagger_1.ApiOperation)({
            summary: 'Get single Ghillie'
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.OK,
            type: (0, shared_1.SwaggerBaseApiResponse)(ghillie_detail_dto_1.GhillieDetailDto)
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.NOT_FOUND
        }),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        __param(0, (0, shared_1.ReqContext)()),
        __param(1, (0, common_1.Param)('id'))
    ], GhillieController.prototype, "getGhillie");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, authorities_guard_1.AuthoritiesGuard),
        (0, authority_decorator_1.Authorities)(client_1.UserAuthority.ROLE_USER),
        (0, swagger_1.ApiBearerAuth)(),
        (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
        (0, common_1.Get)(),
        (0, swagger_1.ApiOperation)({
            summary: 'Get all Ghillies'
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.OK,
            type: (0, shared_1.SwaggerBaseApiResponse)([ghillie_detail_dto_1.GhillieDetailDto])
        }),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        __param(0, (0, shared_1.ReqContext)()),
        __param(1, (0, common_1.Query)())
    ], GhillieController.prototype, "getAllGhillies");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, authorities_guard_1.AuthoritiesGuard),
        (0, authority_decorator_1.Authorities)(client_1.UserAuthority.ROLE_USER),
        (0, swagger_1.ApiBearerAuth)(),
        (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
        (0, common_1.Get)('my/all'),
        (0, swagger_1.ApiOperation)({
            summary: 'Get all Ghillies that the current user is a member of'
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.OK,
            type: (0, shared_1.SwaggerBaseApiResponse)([ghillie_detail_dto_1.GhillieDetailDto])
        }),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        __param(0, (0, shared_1.ReqContext)())
    ], GhillieController.prototype, "getCurrentUsersGhillies");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, authorities_guard_1.AuthoritiesGuard),
        (0, authority_decorator_1.Authorities)(client_1.UserAuthority.ROLE_USER),
        (0, swagger_1.ApiBearerAuth)(),
        (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
        (0, common_1.Post)('all'),
        (0, swagger_1.ApiOperation)({
            summary: 'Get all Ghillies w/ filters'
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.OK,
            type: (0, shared_1.SwaggerBaseApiResponse)([ghillie_detail_dto_1.GhillieDetailDto])
        }),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        __param(0, (0, shared_1.ReqContext)()),
        __param(1, (0, common_1.Body)())
    ], GhillieController.prototype, "getAllGhilliesWithFilter");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, authorities_guard_1.AuthoritiesGuard),
        (0, authority_decorator_1.Authorities)(client_1.UserAuthority.ROLE_ADMIN),
        (0, swagger_1.ApiBearerAuth)(),
        (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
        (0, common_1.Put)(':id'),
        (0, swagger_1.ApiOperation)({
            summary: 'Update a Ghillie'
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.OK,
            type: (0, shared_1.SwaggerBaseApiResponse)(ghillie_detail_dto_1.GhillieDetailDto)
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.NOT_FOUND,
            type: shared_1.BaseApiErrorResponse
        }),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        __param(0, (0, shared_1.ReqContext)()),
        __param(1, (0, common_1.Param)('id')),
        __param(2, (0, common_1.Body)())
    ], GhillieController.prototype, "updateGhillie");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, authorities_guard_1.AuthoritiesGuard),
        (0, authority_decorator_1.Authorities)(client_1.UserAuthority.ROLE_ADMIN),
        (0, swagger_1.ApiBearerAuth)(),
        (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
        (0, common_1.Delete)(':id'),
        (0, swagger_1.ApiOperation)({
            summary: 'Delete a Ghillie'
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.NO_CONTENT
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.NOT_FOUND
        }),
        (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
        __param(0, (0, shared_1.ReqContext)()),
        __param(1, (0, common_1.Param)('id'))
    ], GhillieController.prototype, "deleteGhillie");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, authorities_guard_1.AuthoritiesGuard),
        (0, authority_decorator_1.Authorities)(client_1.UserAuthority.ROLE_USER, client_1.UserAuthority.ROLE_VERIFIED_MILITARY),
        (0, swagger_1.ApiBearerAuth)(),
        (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
        (0, common_1.Put)(':id/join'),
        (0, swagger_1.ApiOperation)({
            summary: 'Join a Ghillie'
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.OK
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.NOT_FOUND,
            type: shared_1.BaseApiErrorResponse
        }),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        __param(0, (0, shared_1.ReqContext)()),
        __param(1, (0, common_1.Param)('id'))
    ], GhillieController.prototype, "joinGhillie");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, authorities_guard_1.AuthoritiesGuard),
        (0, authority_decorator_1.Authorities)(client_1.UserAuthority.ROLE_USER, client_1.UserAuthority.ROLE_VERIFIED_MILITARY),
        (0, swagger_1.ApiBearerAuth)(),
        (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
        (0, common_1.Put)(':id/leave'),
        (0, swagger_1.ApiOperation)({
            summary: 'Leave a Ghillie'
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.OK
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.NOT_FOUND
        }),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        __param(0, (0, shared_1.ReqContext)()),
        __param(1, (0, common_1.Param)('id'))
    ], GhillieController.prototype, "leaveGhillie");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, authorities_guard_1.AuthoritiesGuard),
        (0, authority_decorator_1.Authorities)(client_1.UserAuthority.ROLE_USER),
        (0, swagger_1.ApiBearerAuth)(),
        (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
        (0, common_1.Put)(':id/transfer-ownership'),
        (0, swagger_1.ApiOperation)({
            summary: 'Transfer ownership of a Ghillie'
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.OK
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.NOT_FOUND
        }),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        __param(0, (0, shared_1.ReqContext)()),
        __param(1, (0, common_1.Param)('id')),
        __param(2, (0, common_1.Body)())
    ], GhillieController.prototype, "transferOwnership");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, authorities_guard_1.AuthoritiesGuard),
        (0, authority_decorator_1.Authorities)(client_1.UserAuthority.ROLE_USER),
        (0, swagger_1.ApiBearerAuth)(),
        (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
        (0, common_1.Put)(':id/add-moderator-role'),
        (0, swagger_1.ApiOperation)({
            summary: 'Add Moderator Role to user'
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.OK
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.NOT_FOUND
        }),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        __param(0, (0, shared_1.ReqContext)()),
        __param(1, (0, common_1.Param)('id')),
        __param(2, (0, common_1.Body)())
    ], GhillieController.prototype, "addModerator");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, authorities_guard_1.AuthoritiesGuard),
        (0, authority_decorator_1.Authorities)(client_1.UserAuthority.ROLE_USER),
        (0, swagger_1.ApiBearerAuth)(),
        (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
        (0, common_1.Put)(':id/remove-moderator-role'),
        (0, swagger_1.ApiOperation)({
            summary: 'Remove Moderator Role from user'
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.OK
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.NOT_FOUND
        }),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        __param(0, (0, shared_1.ReqContext)()),
        __param(1, (0, common_1.Param)('id')),
        __param(2, (0, common_1.Body)())
    ], GhillieController.prototype, "removeModerator");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, authorities_guard_1.AuthoritiesGuard),
        (0, authority_decorator_1.Authorities)(client_1.UserAuthority.ROLE_USER),
        (0, swagger_1.ApiBearerAuth)(),
        (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
        (0, common_1.Put)(':id/ban-user'),
        (0, swagger_1.ApiOperation)({
            summary: 'Ban a user from a Ghillie'
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.OK
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.NOT_FOUND
        }),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        __param(0, (0, shared_1.ReqContext)()),
        __param(1, (0, common_1.Param)('id')),
        __param(2, (0, common_1.Body)())
    ], GhillieController.prototype, "banUser");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, authorities_guard_1.AuthoritiesGuard),
        (0, authority_decorator_1.Authorities)(client_1.UserAuthority.ROLE_USER),
        (0, swagger_1.ApiBearerAuth)(),
        (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
        (0, common_1.Put)(':id/unban-user'),
        (0, swagger_1.ApiOperation)({
            summary: 'Unban a user from a Ghillie'
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.OK
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.NOT_FOUND
        }),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        __param(0, (0, shared_1.ReqContext)()),
        __param(1, (0, common_1.Param)('id')),
        __param(2, (0, common_1.Body)())
    ], GhillieController.prototype, "unbanUser");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, authorities_guard_1.AuthoritiesGuard),
        (0, authority_decorator_1.Authorities)(client_1.UserAuthority.ROLE_USER),
        (0, swagger_1.ApiBearerAuth)(),
        (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
        (0, common_1.Put)(':id/add-topics'),
        (0, swagger_1.ApiOperation)({
            summary: 'Add topics to a Ghillie'
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.OK,
            type: (shared_1.BaseApiResponse)
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.NOT_FOUND
        }),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        __param(0, (0, shared_1.ReqContext)()),
        __param(1, (0, common_1.Param)('id')),
        __param(2, (0, common_1.Body)())
    ], GhillieController.prototype, "addTopics");
    __decorate([
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, authorities_guard_1.AuthoritiesGuard),
        (0, authority_decorator_1.Authorities)(client_1.UserAuthority.ROLE_USER),
        (0, swagger_1.ApiBearerAuth)(),
        (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
        (0, common_1.Put)(':id/delete-topics'),
        (0, swagger_1.ApiOperation)({
            summary: 'Deletes topics to a Ghillie'
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.OK,
            type: (shared_1.BaseApiResponse)
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.NOT_FOUND
        }),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        __param(0, (0, shared_1.ReqContext)()),
        __param(1, (0, common_1.Param)('id')),
        __param(2, (0, common_1.Body)())
    ], GhillieController.prototype, "deleteTopics");
    GhillieController = GhillieController_1 = __decorate([
        (0, swagger_1.ApiTags)('ghillies'),
        (0, common_1.Controller)('ghillies')
    ], GhillieController);
    return GhillieController;
}());
exports.GhillieController = GhillieController;
