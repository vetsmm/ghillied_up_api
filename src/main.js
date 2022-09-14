"use strict";
/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
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
var common_1 = require("@nestjs/common");
var core_1 = require("@nestjs/core");
var ip = require("ip");
var Sentry = require("@sentry/node");
var Tracing = require("@sentry/tracing");
var app_module_1 = require("./app/app.module");
var swagger_1 = require("@nestjs/swagger");
var environment_prod_1 = require("./environments/environment.prod");
var shared_1 = require("./shared");
var client_1 = require("@prisma/client");
var config_1 = require("@nestjs/config");
function bootstrap() {
    return __awaiter(this, void 0, void 0, function () {
        var app, config, document_1, appConfig, client, port;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core_1.NestFactory.create(app_module_1.AppModule)];
                case 1:
                    app = _a.sent();
                    app.useGlobalPipes(new common_1.ValidationPipe(shared_1.VALIDATION_PIPE_OPTIONS));
                    app.use(shared_1.RequestIdMiddleware);
                    app.enableCors();
                    if (environment_prod_1.environment.production) {
                        config = new swagger_1.DocumentBuilder()
                            .setTitle('Ghillied Up')
                            .setDescription('The Ghillied Up API description')
                            .setVersion('0.1')
                            .addBearerAuth()
                            .build();
                        document_1 = swagger_1.SwaggerModule.createDocument(app, config);
                        swagger_1.SwaggerModule.setup('swagger-ui', app, document_1);
                        appConfig = app.get(config_1.ConfigService);
                        client = new client_1.PrismaClient();
                        Sentry.init({
                            dsn: appConfig.get('sentryDsn'),
                            integrations: [
                                // enable HTTP calls tracing
                                new Sentry.Integrations.Http({ tracing: true }),
                                // enable Express.js middleware tracing
                                new Tracing.Integrations.Prisma({ client: client }),
                            ],
                            // Set tracesSampleRate to 1.0 to capture 100%
                            // of transactions for performance monitoring.
                            // We recommend adjusting this value in production
                            tracesSampleRate: 1.0
                        });
                        app.useGlobalInterceptors(new shared_1.SentryInterceptor(environment_prod_1.environment.production ? 'production' : 'development'));
                    }
                    port = process.env.PORT || 3333;
                    return [4 /*yield*/, app.listen(port)];
                case 2:
                    _a.sent();
                    common_1.Logger.log("\uD83D\uDE80 Application is running on: http://".concat(ip.address(), ":").concat(port));
                    return [2 /*return*/];
            }
        });
    });
}
bootstrap();
