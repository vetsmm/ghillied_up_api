"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.GhillieMemberDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_transformer_1 = require("class-transformer");
var GhillieMemberDto = /** @class */ (function () {
    function GhillieMemberDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], GhillieMemberDto.prototype, "ghillieId");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], GhillieMemberDto.prototype, "userId");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], GhillieMemberDto.prototype, "joinDate");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], GhillieMemberDto.prototype, "memberStatus");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], GhillieMemberDto.prototype, "role");
    return GhillieMemberDto;
}());
exports.GhillieMemberDto = GhillieMemberDto;
