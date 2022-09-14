"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.UpdateGhillieDto = void 0;
var class_validator_1 = require("class-validator");
var swagger_1 = require("@nestjs/swagger");
var UpdateGhillieDto = /** @class */ (function () {
    function UpdateGhillieDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Ghillie name',
            example: 'Hello world'
        }),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.IsOptional)()
    ], UpdateGhillieDto.prototype, "name");
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Ghillie about',
            example: 'Hello world'
        }),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.IsOptional)()
    ], UpdateGhillieDto.prototype, "about");
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Ghillie readOnly',
            example: true
        }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsBoolean)()
    ], UpdateGhillieDto.prototype, "readOnly");
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Ghillie imageUrl',
            example: 'https://example.com/image.png'
        }),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.IsOptional)()
    ], UpdateGhillieDto.prototype, "imageUrl");
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Ghillie topicNames',
            example: ['topic1', 'topic2']
        }),
        (0, class_validator_1.IsArray)(),
        (0, class_validator_1.IsOptional)()
    ], UpdateGhillieDto.prototype, "topicNames");
    return UpdateGhillieDto;
}());
exports.UpdateGhillieDto = UpdateGhillieDto;
