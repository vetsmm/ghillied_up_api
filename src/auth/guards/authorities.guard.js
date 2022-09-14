"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AuthoritiesGuard = void 0;
var common_1 = require("@nestjs/common");
var authority_decorator_1 = require("../decorators/authority.decorator");
var AuthoritiesGuard = /** @class */ (function () {
    function AuthoritiesGuard(reflector) {
        this.reflector = reflector;
    }
    AuthoritiesGuard.prototype.canActivate = function (context) {
        console.log('context', context);
        var requiredAuthorities = this.reflector.getAllAndOverride(authority_decorator_1.AUTHORITIES_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredAuthorities) {
            return true;
        }
        var user = context.switchToHttp().getRequest().user;
        if (requiredAuthorities.some(function (authority) { var _a; return (_a = user.authorities) === null || _a === void 0 ? void 0 : _a.includes(authority); })) {
            return true;
        }
        throw new common_1.UnauthorizedException("User does not have the required authorities to access this resource.");
    };
    AuthoritiesGuard = __decorate([
        (0, common_1.Injectable)()
    ], AuthoritiesGuard);
    return AuthoritiesGuard;
}());
exports.AuthoritiesGuard = AuthoritiesGuard;
