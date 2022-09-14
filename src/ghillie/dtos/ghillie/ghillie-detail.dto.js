"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.GhillieDetailDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_transformer_1 = require("class-transformer");
var topic_lite_output_dto_1 = require("../topic/topic-lite-output.dto");
var GhillieDetailDto = /** @class */ (function () {
    function GhillieDetailDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], GhillieDetailDto.prototype, "id");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], GhillieDetailDto.prototype, "name");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], GhillieDetailDto.prototype, "slug");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], GhillieDetailDto.prototype, "about");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], GhillieDetailDto.prototype, "readOnly");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], GhillieDetailDto.prototype, "imageUrl");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)(),
        (0, class_transformer_1.Type)(function () { return topic_lite_output_dto_1.TopicLiteOutputDto; })
    ], GhillieDetailDto.prototype, "topics");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], GhillieDetailDto.prototype, "ownerUsername");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], GhillieDetailDto.prototype, "status");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], GhillieDetailDto.prototype, "createdAt");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], GhillieDetailDto.prototype, "updatedAt");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)(),
        (0, class_transformer_1.Transform)(function (value) { var _a; return (_a = value.obj._count) === null || _a === void 0 ? void 0 : _a.members; }, { toClassOnly: true })
    ], GhillieDetailDto.prototype, "totalMembers");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)()
    ], GhillieDetailDto.prototype, "lastPostDate");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_transformer_1.Expose)(),
        (0, class_transformer_1.Transform)(function (value) {
            return value.obj.members !== undefined && value.obj.members.length > 0
                ? {
                    joinDate: value.obj.members[0].joinDate,
                    memberStatus: value.obj.members[0].memberStatus,
                    role: value.obj.members[0].role
                }
                : null;
        }, { toClassOnly: true })
    ], GhillieDetailDto.prototype, "memberMeta");
    return GhillieDetailDto;
}());
exports.GhillieDetailDto = GhillieDetailDto;
