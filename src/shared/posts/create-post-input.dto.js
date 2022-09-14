"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.CreatePostInputDto = void 0;
var client_1 = require("@prisma/client");
var swagger_1 = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var CreatePostInputDto = /** @class */ (function () {
    function CreatePostInputDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsString)()
    ], CreatePostInputDto.prototype, "title");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MaxLength)(400)
    ], CreatePostInputDto.prototype, "content");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsEnum)(client_1.PostStatus),
        (0, class_validator_1.IsOptional)()
    ], CreatePostInputDto.prototype, "status");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsString)()
    ], CreatePostInputDto.prototype, "ghillieId");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsArray)(),
        (0, class_validator_1.IsOptional)()
    ], CreatePostInputDto.prototype, "postTagNames");
    return CreatePostInputDto;
}());
exports.CreatePostInputDto = CreatePostInputDto;
