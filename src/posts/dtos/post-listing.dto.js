"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.PostListingDto = exports.TagMetaDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_transformer_1 = require("class-transformer");
var post_detail_dto_1 = require("./post-detail.dto");
var TagMetaDto = /** @class */ (function () {
    function TagMetaDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], TagMetaDto.prototype, "id");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], TagMetaDto.prototype, "name");
    return TagMetaDto;
}());
exports.TagMetaDto = TagMetaDto;
var PostListingDto = /** @class */ (function () {
    function PostListingDto() {
        this.numberOfComments = 0;
        this.numberOfReactions = 0;
        this.currentUserReaction = null;
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostListingDto.prototype, "id");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostListingDto.prototype, "uid");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostListingDto.prototype, "title");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostListingDto.prototype, "content");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostListingDto.prototype, "status");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)(),
        (0, class_transformer_1.Type)(function () { return post_detail_dto_1.PostUserMetaDto; })
    ], PostListingDto.prototype, "postedBy");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostListingDto.prototype, "createdDate");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], PostListingDto.prototype, "edited");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)(),
        (0, class_transformer_1.Type)(function () { return TagMetaDto; })
    ], PostListingDto.prototype, "tags");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)(),
        (0, class_transformer_1.Type)(function () { return post_detail_dto_1.PostGhillieMetaDto; })
    ], PostListingDto.prototype, "ghillie");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)(),
        (0, class_transformer_1.Transform)(function (value) { var _a; return (_a = value.obj._count) === null || _a === void 0 ? void 0 : _a.postComments; }, { toClassOnly: true })
    ], PostListingDto.prototype, "numberOfComments");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)(),
        (0, class_transformer_1.Transform)(function (value) { var _a; return (_a = value.obj._count) === null || _a === void 0 ? void 0 : _a.postReaction; }, { toClassOnly: true })
    ], PostListingDto.prototype, "numberOfReactions");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)(),
        (0, class_transformer_1.Transform)(function (value) {
            return value.obj.postReaction !== undefined &&
                value.obj.postReaction.length > 0
                ? value.obj.postReaction.reactionType
                : null;
        }, { toClassOnly: true })
    ], PostListingDto.prototype, "currentUserReaction");
    return PostListingDto;
}());
exports.PostListingDto = PostListingDto;
