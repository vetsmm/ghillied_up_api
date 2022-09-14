"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.CreateGhillieInputDto = void 0;
var class_validator_1 = require("class-validator");
var swagger_1 = require("@nestjs/swagger");
var CreateGhillieInputDto = /** @class */ (function () {
    function CreateGhillieInputDto() {
    }
    __decorate([
        (0, class_validator_1.IsNotEmpty)(),
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsString)()
    ], CreateGhillieInputDto.prototype, "name");
    __decorate([
        (0, class_validator_1.IsOptional)(),
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsString)()
    ], CreateGhillieInputDto.prototype, "about");
    __decorate([
        (0, class_validator_1.IsNotEmpty)(),
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsBoolean)()
    ], CreateGhillieInputDto.prototype, "readOnly");
    __decorate([
        (0, class_validator_1.IsOptional)(),
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsString)()
        // TODO: Move to S3 reference
        //  keep this until we move to S3, where we will remove this in the request, and replace with the S3 location
    ], CreateGhillieInputDto.prototype, "imageUrl");
    __decorate([
        (0, class_validator_1.IsNotEmpty)(),
        (0, swagger_1.ApiProperty)({
            type: [String]
        }),
        (0, class_validator_1.IsArray)(),
        (0, class_validator_1.IsOptional)()
    ], CreateGhillieInputDto.prototype, "topicNames");
    return CreateGhillieInputDto;
}());
exports.CreateGhillieInputDto = CreateGhillieInputDto;
