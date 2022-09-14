"use strict";
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
var config_1 = require("@nestjs/config");
var core_1 = require("@nestjs/core");
var app_module_1 = require("./app/app.module");
var commander = require("commander");
var bcrypt_1 = require("bcrypt");
var slugify_1 = require("slugify");
var client_1 = require("@prisma/client");
var prisma_service_1 = require("./prisma/prisma.service");
function bootstrap() {
    return __awaiter(this, void 0, void 0, function () {
        var app, configService, prisma, defaultAdminUserPassword, program, options, user, _a, _b;
        var _c, _d;
        var _this = this;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, core_1.NestFactory.createApplicationContext(app_module_1.AppModule)];
                case 1:
                    app = _e.sent();
                    configService = app.get(config_1.ConfigService);
                    prisma = app.get(prisma_service_1.PrismaService);
                    defaultAdminUserPassword = configService.get('defaultAdminUserPassword');
                    program = commander.program;
                    program
                        // .command('createsuperuser')
                        .requiredOption('-f, --first-name <first_name>', 'The First Name of the User.')
                        .requiredOption('-l, --last-name <last_name>', 'The Last Name of the User.')
                        .requiredOption('-u, --username <username>', 'The Username of the User.')
                        .requiredOption('-p, --password <password>', 'The Password of the User.')
                        .requiredOption('-e, --email <email>', 'The Email of the User.')
                        .description('Creates a Super User for Ghillied Up.')
                        .action(function (app, command) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/];
                        });
                    }); });
                    program.parse(process.argv);
                    options = program.opts();
                    _b = (_a = prisma.user).upsert;
                    _c = {
                        where: {
                            username: options.username
                        },
                        update: {
                            activated: true,
                            authorities: [client_1.UserAuthority.ROLE_ADMIN, client_1.UserAuthority.ROLE_USER, client_1.UserAuthority.ROLE_MODERATOR]
                        }
                    };
                    _d = {
                        username: options.username
                    };
                    return [4 /*yield*/, (0, bcrypt_1.hash)(options.password, 10)];
                case 2: return [4 /*yield*/, _b.apply(_a, [(_c.create = (_d.password = _e.sent(),
                            _d.email = options.email,
                            _d.firstName = options.firstName,
                            _d.lastName = options.lastName,
                            _d.slug = (0, slugify_1["default"])(options.username, {
                                replacement: '-',
                                lower: false,
                                strict: true,
                                trim: true
                            }),
                            _d.authorities = [client_1.UserAuthority.ROLE_ADMIN, client_1.UserAuthority.ROLE_USER, client_1.UserAuthority.ROLE_MODERATOR],
                            _d.activated = true,
                            _d),
                            _c)])];
                case 3:
                    user = _e.sent();
                    console.log("Created Super User: ", user.username);
                    return [4 /*yield*/, app.close()];
                case 4:
                    _e.sent();
                    return [2 /*return*/];
            }
        });
    });
}
bootstrap();
