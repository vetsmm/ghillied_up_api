"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.PostReactionInputDto = void 0;
var client_1 = require("@prisma/client");
var swagger_1 = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var PostReactionInputDto = /** @class */ (function () {
    function PostReactionInputDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'The reaciton type',
            example: client_1.ReactionType.THUMBS_UP
        }),
        (0, class_validator_1.IsEnum)(client_1.ReactionType),
        (0, class_validator_1.IsOptional)()
    ], PostReactionInputDto.prototype, "reactionType");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsString)()
    ], PostReactionInputDto.prototype, "postId");
    return PostReactionInputDto;
}());
exports.PostReactionInputDto = PostReactionInputDto;
