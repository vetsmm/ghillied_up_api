"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.CommentDetailDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_transformer_1 = require("class-transformer");
var client_1 = require("@prisma/client");
var class_validator_1 = require("class-validator");
var post_detail_dto_1 = require("../post-detail.dto");
var CommentDetailDto = /** @class */ (function () {
    function CommentDetailDto() {
        this.numberOfChildComments = 0;
        this.currentUserReaction = null;
        this.likedByCurrentUser = false;
        this.numberOfReactions = 0;
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], CommentDetailDto.prototype, "id");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], CommentDetailDto.prototype, "content");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)(),
        (0, class_validator_1.IsEnum)(client_1.CommentStatus)
    ], CommentDetailDto.prototype, "status");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], CommentDetailDto.prototype, "createdDate");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], CommentDetailDto.prototype, "updatedDate");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)(),
        (0, class_transformer_1.Type)(function () { return post_detail_dto_1.PostUserMetaDto; })
    ], CommentDetailDto.prototype, "createdBy");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], CommentDetailDto.prototype, "edited");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], CommentDetailDto.prototype, "postId");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], CommentDetailDto.prototype, "commentHeight");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], CommentDetailDto.prototype, "childCommentIds");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)(),
        (0, class_transformer_1.Transform)(function (value) { return value.obj.childCommentIds.length; }, { toClassOnly: true })
    ], CommentDetailDto.prototype, "numberOfChildComments");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)(),
        (0, class_transformer_1.Transform)(function (value) {
            return value.obj.commentReaction !== undefined &&
                value.obj.commentReaction.length > 0
                ? value.obj.commentReaction.reactionType
                : null;
        }, { toClassOnly: true })
    ], CommentDetailDto.prototype, "currentUserReaction");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)(),
        (0, class_transformer_1.Transform)(function (value) {
            return (value.obj.commentReaction !== undefined &&
                value.obj.commentReaction.length > 0);
        }, { toClassOnly: true })
    ], CommentDetailDto.prototype, "likedByCurrentUser");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)(),
        (0, class_transformer_1.Transform)(function (value) { var _a; return (_a = value.obj._count) === null || _a === void 0 ? void 0 : _a.commentReaction; }, {
            toClassOnly: true
        })
    ], CommentDetailDto.prototype, "numberOfReactions");
    return CommentDetailDto;
}());
exports.CommentDetailDto = CommentDetailDto;
