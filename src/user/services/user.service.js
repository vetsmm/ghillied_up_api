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
exports.UserService = void 0;
var common_1 = require("@nestjs/common");
var bcrypt_1 = require("bcrypt");
var user_output_dto_1 = require("../dtos/public/user-output.dto");
var slugify_1 = require("slugify");
var class_transformer_1 = require("class-transformer");
var user_output_anonymous_dto_1 = require("../dtos/anonymous/user-output-anonymous.dto");
var UserService = /** @class */ (function () {
    function UserService(prisma, logger, configService) {
        this.prisma = prisma;
        this.logger = logger;
        this.configService = configService;
        this.logger.setContext(UserService_1.name);
    }
    UserService_1 = UserService;
    UserService.prototype.createUser = function (ctx, input) {
        return __awaiter(this, void 0, void 0, function () {
            var user, _a, _b, output;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.createUser.name, " was called"));
                        this.logger.log(ctx, "Saving User ".concat(input.username));
                        _b = (_a = this.prisma.user).create;
                        _c = {};
                        _d = {
                            username: input.username
                        };
                        return [4 /*yield*/, (0, bcrypt_1.hash)(input.password, 10)];
                    case 1:
                        _d.password = _e.sent(),
                            _d.email = input.email,
                            _d.firstName = input.firstName,
                            _d.lastName = input.lastName,
                            _d.serviceStatus = input.serviceStatus,
                            _d.branch = input.branch,
                            _d.serviceEntryDate = input.serviceEntryDate,
                            _d.serviceExitDate = input.serviceExitDate,
                            _d.slug = (0, slugify_1["default"])(input.username, {
                                replacement: '-',
                                lower: false,
                                strict: true,
                                trim: true
                            });
                        return [4 /*yield*/, this.generateCode()];
                    case 2: return [4 /*yield*/, _b.apply(_a, [(_c.data = (_d.activationCode = _e.sent(),
                                _d.activationCodeSentAt = new Date(),
                                _d),
                                _c)])];
                    case 3:
                        user = _e.sent();
                        output = (0, class_transformer_1.plainToInstance)(user_output_dto_1.UserOutput, user, {
                            excludeExtraneousValues: true
                        });
                        return [2 /*return*/, { output: output, activationCode: user.activationCode }];
                }
            });
        });
    };
    UserService.prototype.generateNewActivationCode = function (ctx, resendVerifyEmailInputDto) {
        return __awaiter(this, void 0, void 0, function () {
            var user, _a, _b, user, _c, _d;
            var _e, _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.generateNewActivationCode.name, " was called"));
                        if (!(resendVerifyEmailInputDto.email !== undefined)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.findByEmail(ctx, resendVerifyEmailInputDto.email)];
                    case 1:
                        user = _j.sent();
                        _b = (_a = this.prisma.user).update;
                        _e = {
                            where: { id: user.id }
                        };
                        _f = {};
                        return [4 /*yield*/, this.generateCode()];
                    case 2: return [2 /*return*/, _b.apply(_a, [(_e.data = (_f.activationCode = _j.sent(),
                                _f.activationCodeSentAt = new Date(),
                                _f),
                                _e)])];
                    case 3: return [4 /*yield*/, this.findByUsername(ctx, resendVerifyEmailInputDto.username)];
                    case 4:
                        user = _j.sent();
                        _d = (_c = this.prisma.user).update;
                        _g = {
                            where: { id: user.id }
                        };
                        _h = {};
                        return [4 /*yield*/, this.generateCode()];
                    case 5: return [2 /*return*/, _d.apply(_c, [(_g.data = (_h.activationCode = _j.sent(),
                                _h.activationCodeSentAt = new Date(),
                                _h),
                                _g)])];
                }
            });
        });
    };
    UserService.prototype.validateUsernamePassword = function (ctx, username, pass) {
        return __awaiter(this, void 0, void 0, function () {
            var user, match;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.validateUsernamePassword.name, " was called"));
                        this.logger.log(ctx, "calling findOne");
                        return [4 /*yield*/, this.prisma.user.findFirst({
                                where: { username: { equals: username, mode: 'insensitive' } }
                            })];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            throw new common_1.UnauthorizedException('Invalid username or password');
                        if (user.activated === false)
                            throw new common_1.ForbiddenException('User is not activated');
                        return [4 /*yield*/, (0, bcrypt_1.compare)(pass, user.password)];
                    case 2:
                        match = _a.sent();
                        if (!match)
                            throw new common_1.UnauthorizedException();
                        return [2 /*return*/, (0, class_transformer_1.plainToInstance)(user_output_dto_1.UserOutput, user, {
                                excludeExtraneousValues: true
                            })];
                }
            });
        });
    };
    UserService.prototype.getUsers = function (ctx, limit, offset) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, count, users, usersOutput;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.getUsers.name, " was called"));
                        this.logger.log(ctx, "calling findAndCount");
                        return [4 /*yield*/, this.prisma.$transaction([
                                // @todo check if they ever change this shit solution
                                this.prisma.user.count(),
                                this.prisma.user.findMany({
                                    where: {},
                                    take: limit,
                                    skip: offset
                                }),
                            ])];
                    case 1:
                        _a = _b.sent(), count = _a[0], users = _a[1];
                        usersOutput = (0, class_transformer_1.plainToInstance)(user_output_dto_1.UserOutput, users, {
                            excludeExtraneousValues: true
                        });
                        return [2 /*return*/, { users: usersOutput, count: count }];
                }
            });
        });
    };
    UserService.prototype.getUsersAnon = function (ctx, limit, offset) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, count, users, usersOutput;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.getUsers.name, " was called"));
                        this.logger.log(ctx, "calling findAndCount");
                        return [4 /*yield*/, this.prisma.$transaction([
                                // @todo check if they ever change this shit solution
                                this.prisma.user.count(),
                                this.prisma.user.findMany({
                                    where: {},
                                    take: limit,
                                    skip: offset
                                }),
                            ])];
                    case 1:
                        _a = _b.sent(), count = _a[0], users = _a[1];
                        usersOutput = (0, class_transformer_1.plainToInstance)(user_output_anonymous_dto_1.UserOutputAnonymousDto, users, {
                            excludeExtraneousValues: true
                        });
                        return [2 /*return*/, { users: usersOutput, count: count }];
                }
            });
        });
    };
    UserService.prototype.findById = function (ctx, id) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.findById.name, " was called"));
                        return [4 /*yield*/, this.prisma.user.findUnique({ where: { id: id } })];
                    case 1:
                        user = _a.sent();
                        return [2 /*return*/, (0, class_transformer_1.plainToInstance)(user_output_dto_1.UserOutput, user, {
                                excludeExtraneousValues: true
                            })];
                }
            });
        });
    };
    UserService.prototype.getUserById = function (ctx, id) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.getUserById.name, " was called"));
                        return [4 /*yield*/, this.prisma.user.findUnique({ where: { id: id } })];
                    case 1:
                        user = _a.sent();
                        return [2 /*return*/, (0, class_transformer_1.plainToInstance)(user_output_dto_1.UserOutput, user, {
                                excludeExtraneousValues: true
                            })];
                }
            });
        });
    };
    UserService.prototype.getUserBySlug = function (ctx, slug) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.getUserBySlug.name, " was called"));
                        return [4 /*yield*/, this.prisma.user.findUnique({ where: { slug: slug } })];
                    case 1:
                        user = _a.sent();
                        return [2 /*return*/, (0, class_transformer_1.plainToInstance)(user_output_anonymous_dto_1.UserOutputAnonymousDto, user, {
                                excludeExtraneousValues: true
                            })];
                }
            });
        });
    };
    UserService.prototype.updateUser = function (ctx, userId, input) {
        return __awaiter(this, void 0, void 0, function () {
            var user, _a, updatedUser;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.updateUser.name, " was called"));
                        return [4 /*yield*/, this.prisma.user.findUnique({ where: { id: userId } })];
                    case 1:
                        user = _b.sent();
                        if (!input.password) return [3 /*break*/, 3];
                        _a = input;
                        return [4 /*yield*/, (0, bcrypt_1.hash)(input.password, 10)];
                    case 2:
                        _a.password = _b.sent();
                        _b.label = 3;
                    case 3:
                        updatedUser = __assign(__assign({}, user), input);
                        return [4 /*yield*/, this.prisma.user.update({
                                where: { id: userId },
                                data: updatedUser
                            })];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, (0, class_transformer_1.plainToInstance)(user_output_dto_1.UserOutput, updatedUser, {
                                excludeExtraneousValues: true
                            })];
                }
            });
        });
    };
    UserService.prototype.activateUser = function (ctx, activationDto) {
        return __awaiter(this, void 0, void 0, function () {
            var user, updatedUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.activateUser.name, " was called"));
                        if (!activationDto.email) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.prisma.user.findFirst({
                                where: {
                                    AND: [
                                        { email: { equals: activationDto.email, mode: 'insensitive' } },
                                        { activationCode: { equals: activationDto.activationCode } },
                                    ]
                                }
                            })];
                    case 1:
                        user = _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.prisma.user.findFirst({
                            where: {
                                AND: [
                                    {
                                        username: { equals: activationDto.username, mode: 'insensitive' }
                                    },
                                    { activationCode: { equals: activationDto.activationCode } },
                                ]
                            }
                        })];
                    case 3:
                        user = _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!user)
                            throw new common_1.NotFoundException('Activation code is invalid');
                        if (this.isExpired(user.activationCodeSentAt, 'auth.activationCodeExpiryInMs'))
                            throw new common_1.ForbiddenException('Activation code is expired');
                        return [4 /*yield*/, this.prisma.user.update({
                                where: { id: user.id },
                                data: {
                                    activationCode: null,
                                    activated: true,
                                    activationCodeSentAt: null
                                }
                            })];
                    case 5:
                        updatedUser = _a.sent();
                        return [2 /*return*/, (0, class_transformer_1.plainToInstance)(user_output_dto_1.UserOutput, updatedUser, {
                                excludeExtraneousValues: true
                            })];
                }
            });
        });
    };
    UserService.prototype.changePassword = function (ctx, username, newPassword) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        this.logger.log(ctx, "".concat(this.changePassword.name, " was called"));
                        _b = (_a = this.prisma.user).update;
                        _c = {
                            where: { username: username }
                        };
                        _d = {};
                        return [4 /*yield*/, (0, bcrypt_1.hash)(newPassword, 10)];
                    case 1: return [2 /*return*/, _b.apply(_a, [(_c.data = (_d.password = _e.sent(),
                                _d),
                                _c)])];
                }
            });
        });
    };
    UserService.prototype.updateLastLogin = function (ctx, id) {
        this.logger.log(ctx, "".concat(this.updateLastLogin.name, " was called"));
        return this.prisma.user.update({
            where: { id: id },
            data: {
                lastLoginAt: new Date()
            }
        });
    };
    UserService.prototype.resetPassword = function (ctx, email) {
        var _this = this;
        this.logger.log(ctx, "".concat(this.resetPassword.name, " was called"));
        return this.prisma.user
            .findFirst({
            where: {
                email: { equals: email, mode: 'insensitive' }
            }
        })
            .then(function (user) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!user.activated) return [3 /*break*/, 2];
                        _b = (_a = this.prisma.user).update;
                        _c = {
                            where: { id: user.id }
                        };
                        _d = {};
                        return [4 /*yield*/, this.generateCode()];
                    case 1: return [2 /*return*/, _b.apply(_a, [(_c.data = (_d.resetKey = _e.sent(),
                                _d.resetDate = new Date(),
                                _d),
                                _c)])];
                    case 2: throw new common_1.BadRequestException('User is not activated');
                }
            });
        }); })["catch"](function () {
            throw new common_1.NotFoundException('User not found');
        });
    };
    UserService.prototype.resetPasswordFinish = function (ctx, input) {
        var _this = this;
        this.logger.log(ctx, "".concat(this.resetPasswordFinish.name, " was called"));
        this.logger.error(ctx, "INPUT: ".concat(input));
        return this.prisma.user
            .findFirst({
            where: {
                AND: [
                    { email: { equals: input.email, mode: 'insensitive' } },
                    { resetKey: { equals: input.resetKey } },
                ]
            }
        })
            .then(function (user) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!user.resetDate) return [3 /*break*/, 3];
                        if (!!this.isExpired(user.resetDate, 'auth.passwordResetTokenExpiryInMs')) return [3 /*break*/, 2];
                        _b = (_a = this.prisma.user).update;
                        _c = {
                            where: { id: user.id }
                        };
                        _d = {};
                        return [4 /*yield*/, (0, bcrypt_1.hash)(input.newPassword, 10)];
                    case 1: return [2 /*return*/, _b.apply(_a, [(_c.data = (_d.password = _e.sent(),
                                _d.resetKey = null,
                                _d.resetDate = null,
                                _d),
                                _c)])];
                    case 2:
                        // Reset the keys
                        this.prisma.user.update({
                            where: { id: user.id },
                            data: {
                                resetKey: null,
                                resetDate: null
                            }
                        });
                        throw new common_1.BadRequestException('Reset key is expired');
                    case 3: throw new common_1.BadRequestException('Reset key is invalid');
                }
            });
        }); })["catch"](function () {
            throw new common_1.NotFoundException('Invalid Email or Reset Key Provided');
        });
    };
    UserService.prototype.usernameExists = function (ctx, username) {
        this.logger.log(ctx, "".concat(this.usernameExists.name, " was called"));
        return this.prisma.user
            .findFirst({
            where: { username: { equals: username, mode: 'insensitive' } }
        })
            .then(function (user) {
            return !!user;
        })["catch"](function () {
            return false;
        });
    };
    UserService.prototype.findByEmail = function (ctx, email) {
        this.logger.log(ctx, "".concat(this.findByEmail.name, " was called"));
        return this.prisma.user
            .findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
            .then(function (user) {
            return (0, class_transformer_1.plainToInstance)(user_output_dto_1.UserOutput, user, {
                excludeExtraneousValues: true
            });
        })["catch"](function () {
            throw new common_1.NotFoundException('User not found');
        });
    };
    UserService.prototype.findByUsername = function (ctx, username) {
        this.logger.log(ctx, "".concat(this.findByUsername.name, " was called"));
        return this.prisma.user
            .findFirst({
            where: { username: { equals: username, mode: 'insensitive' } }
        })
            .then(function (user) {
            return (0, class_transformer_1.plainToInstance)(user_output_dto_1.UserOutput, user, {
                excludeExtraneousValues: true
            });
        })["catch"](function () {
            throw new common_1.NotFoundException('User not found');
        });
    };
    UserService.prototype.emailExists = function (ctx, email) {
        this.logger.log(ctx, "".concat(this.emailExists.name, " was called"));
        return this.prisma.user
            .findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
            .then(function (user) {
            return !!user;
        })["catch"](function () {
            return false;
        });
    };
    UserService.prototype.generateCode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var activationCode, foundUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        activationCode = Math.floor(100000 + Math.random() * 900000);
                        return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { activationCode: activationCode }
                            })];
                    case 1:
                        foundUser = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (foundUser) return [3 /*break*/, 0];
                        _a.label = 3;
                    case 3: return [2 /*return*/, activationCode];
                }
            });
        });
    };
    UserService.prototype.verifyPasswordResetKey = function (ctx, input) {
        var _this = this;
        this.logger.log(ctx, "".concat(this.verifyPasswordResetKey.name, " was called"));
        return this.prisma.user
            .findFirst({
            where: {
                AND: [
                    { resetKey: { equals: input.resetKey } },
                    { email: { equals: input.email, mode: 'insensitive' } },
                ]
            }
        })
            .then(function (user) {
            if (user.resetDate) {
                if (!_this.isExpired(user.resetDate, 'auth.passwordResetTokenExpiryInMs')) {
                    return true;
                }
                else {
                    // Reset the keys
                    _this.prisma.user.update({
                        where: { id: user.id },
                        data: {
                            resetKey: null,
                            resetDate: null
                        }
                    });
                    throw new common_1.BadRequestException('Reset key is expired');
                }
            }
            throw new common_1.BadRequestException('Reset key is invalid');
        })["catch"](function () {
            throw new common_1.BadRequestException('Invalid Email or Reset Key Provided');
        });
    };
    UserService.prototype.isExpired = function (sentDate, configKey) {
        var expiryMs = this.configService.get(configKey);
        return sentDate.getTime() + expiryMs < new Date().getTime();
    };
    var UserService_1;
    UserService = UserService_1 = __decorate([
        (0, common_1.Injectable)()
    ], UserService);
    return UserService;
}());
exports.UserService = UserService;
