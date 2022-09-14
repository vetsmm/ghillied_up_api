"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.FeedInputDto = void 0;
var class_validator_1 = require("class-validator");
var swagger_1 = require("@nestjs/swagger");
var FeedInputDto = /** @class */ (function () {
    function FeedInputDto() {
        this.take = 25;
        this.orderBy = 'desc';
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.IsOptional)()
    ], FeedInputDto.prototype, "cursor");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsNumber)(),
        (0, class_validator_1.IsOptional)()
    ], FeedInputDto.prototype, "take");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsObject)(),
        (0, class_validator_1.IsOptional)()
    ], FeedInputDto.prototype, "filters");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.IsOptional)()
    ], FeedInputDto.prototype, "orderBy");
    return FeedInputDto;
}());
exports.FeedInputDto = FeedInputDto;
