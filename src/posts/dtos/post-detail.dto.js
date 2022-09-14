"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.PostDetailDto = exports.PostUserMetaDto = exports.PostGhillieMetaDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_transformer_1 = require("class-transformer");
var PostGhillieMetaDto = /** @class */ (function () {
    function PostGhillieMetaDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostGhillieMetaDto.prototype, "id");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostGhillieMetaDto.prototype, "name");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostGhillieMetaDto.prototype, "imageUrl");
    return PostGhillieMetaDto;
}());
exports.PostGhillieMetaDto = PostGhillieMetaDto;
var PostUserMetaDto = /** @class */ (function () {
    function PostUserMetaDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostUserMetaDto.prototype, "username");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostUserMetaDto.prototype, "branch");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostUserMetaDto.prototype, "serviceStatus");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostUserMetaDto.prototype, "slug");
    return PostUserMetaDto;
}());
exports.PostUserMetaDto = PostUserMetaDto;
var PostDetailDto = /** @class */ (function () {
    function PostDetailDto() {
        this.numberOfComments = 0;
        this.numberOfReactions = 0;
        this.currentUserReaction = null;
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostDetailDto.prototype, "id");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostDetailDto.prototype, "uid");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostDetailDto.prototype, "title");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostDetailDto.prototype, "content");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostDetailDto.prototype, "status");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)(),
        (0, class_transformer_1.Type)(function () { return PostGhillieMetaDto; })
    ], PostDetailDto.prototype, "ghillie");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)(),
        (0, class_transformer_1.Type)(function () { return PostUserMetaDto; })
    ], PostDetailDto.prototype, "postedBy");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostDetailDto.prototype, "createdDate");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostDetailDto.prototype, "updatedDate");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostDetailDto.prototype, "edited");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostDetailDto.prototype, "tags");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)(),
        (0, class_transformer_1.Transform)(function (value) { var _a; return (_a = value.obj._count) === null || _a === void 0 ? void 0 : _a.postComments; }, { toClassOnly: true })
    ], PostDetailDto.prototype, "numberOfComments");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)(),
        (0, class_transformer_1.Transform)(function (value) { var _a; return (_a = value.obj._count) === null || _a === void 0 ? void 0 : _a.postReaction; }, { toClassOnly: true })
    ], PostDetailDto.prototype, "numberOfReactions");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)(),
        (0, class_transformer_1.Transform)(function (value) {
            return value.obj.postReaction !== undefined &&
                value.obj.postReaction.length > 0
                ? value.obj.postReaction.reactionType
                : null;
        }, { toClassOnly: true })
    ], PostDetailDto.prototype, "currentUserReaction");
    return PostDetailDto;
}());
exports.PostDetailDto = PostDetailDto;
