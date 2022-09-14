"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AuthPasswordResetVerifyKeyDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var AuthPasswordResetVerifyKeyDto = /** @class */ (function () {
    function AuthPasswordResetVerifyKeyDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.Min)(100000),
        (0, class_validator_1.Max)(999999),
        (0, class_validator_1.IsNumber)()
    ], AuthPasswordResetVerifyKeyDto.prototype, "resetKey");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.MaxLength)(100),
        (0, class_validator_1.IsEmail)()
    ], AuthPasswordResetVerifyKeyDto.prototype, "email");
    return AuthPasswordResetVerifyKeyDto;
}());
exports.AuthPasswordResetVerifyKeyDto = AuthPasswordResetVerifyKeyDto;
