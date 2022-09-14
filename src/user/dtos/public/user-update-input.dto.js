"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.UpdateUserInput = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var client_1 = require("@prisma/client");
var UpdateUserInput = /** @class */ (function () {
    function UpdateUserInput() {
    }
    __decorate([
        (0, swagger_1.ApiPropertyOptional)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.MaxLength)(100),
        (0, class_validator_1.IsString)()
    ], UpdateUserInput.prototype, "firstName");
    __decorate([
        (0, swagger_1.ApiPropertyOptional)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.MaxLength)(100),
        (0, class_validator_1.IsString)()
    ], UpdateUserInput.prototype, "lastName");
    __decorate([
        (0, swagger_1.ApiPropertyOptional)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.Length)(6, 100),
        (0, class_validator_1.IsString)()
    ], UpdateUserInput.prototype, "password");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.IsEmail)(),
        (0, class_validator_1.MaxLength)(100)
    ], UpdateUserInput.prototype, "email");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsDate)()
    ], UpdateUserInput.prototype, "serviceEntryDate");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsDate)()
    ], UpdateUserInput.prototype, "serviceExitDate");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsEnum)(client_1.ServiceBranch)
    ], UpdateUserInput.prototype, "branch");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsEnum)(client_1.ServiceStatus)
    ], UpdateUserInput.prototype, "serviceStatus");
    return UpdateUserInput;
}());
exports.UpdateUserInput = UpdateUserInput;
