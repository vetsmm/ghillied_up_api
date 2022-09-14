"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.PostReactionSubsetDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_transformer_1 = require("class-transformer");
var posts_1 = require("../posts");
var PostReactionSubsetDto = /** @class */ (function () {
    function PostReactionSubsetDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostReactionSubsetDto.prototype, "reactions");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostReactionSubsetDto.prototype, "totalReactions");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)(),
        (0, class_transformer_1.Type)(function () { return posts_1.PostDetailDto; })
    ], PostReactionSubsetDto.prototype, "post");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostReactionSubsetDto.prototype, "postId");
    return PostReactionSubsetDto;
}());
exports.PostReactionSubsetDto = PostReactionSubsetDto;
