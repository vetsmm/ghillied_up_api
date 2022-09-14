"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.RegisterInput = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var client_1 = require("@prisma/client");
var RegisterInput = /** @class */ (function () {
    function RegisterInput() {
        // These keys can only be set by ADMIN users.
        this.authorities = [client_1.UserAuthority.ROLE_USER];
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.MaxLength)(100, {
            message: 'First name must be at most 100 characters long'
        }),
        (0, class_validator_1.IsString)()
    ], RegisterInput.prototype, "firstName");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.MaxLength)(100, {
            message: 'Last name must be at most 100 characters long'
        }),
        (0, class_validator_1.IsOptional)()
    ], RegisterInput.prototype, "lastName");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.MaxLength)(100, {
            message: 'Username must be at most 100 characters long'
        }),
        (0, class_validator_1.IsString)({
            message: 'Username must be a string'
        }),
        (0, class_validator_1.IsNotEmpty)({
            message: 'Username is required'
        })
    ], RegisterInput.prototype, "username");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsNotEmpty)({
            message: 'Password is required'
        }),
        (0, class_validator_1.Length)(6, 100, {
            message: 'Password must be between 6 and 100 characters long'
        }),
        (0, class_validator_1.IsString)()
    ], RegisterInput.prototype, "password");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsNotEmpty)({
            message: 'Email is required'
        }),
        (0, class_validator_1.IsEmail)({
            message: 'Email must be a valid email address'
        }),
        (0, class_validator_1.MaxLength)(100, {
            message: 'Email must be at most 100 characters long'
        })
    ], RegisterInput.prototype, "email");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsDate)({
            message: 'Service Entry must be a valid date'
        })
    ], RegisterInput.prototype, "serviceEntryDate");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsDate)({
            message: 'Service Exit must be a valid date'
        })
    ], RegisterInput.prototype, "serviceExitDate");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsEnum)(client_1.ServiceBranch, {
            message: 'Service Branch must be one of the following: ' +
                Object.values(client_1.ServiceBranch)
                    .map(function (branch) { return branch.toString(); })
                    .join(', ')
        })
    ], RegisterInput.prototype, "branch");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsEnum)(client_1.ServiceStatus, {
            message: 'Service Status must be one of the following: ' +
                Object.values(client_1.ServiceStatus)
                    .map(function (status) { return status.toString(); })
                    .join(', ')
        })
    ], RegisterInput.prototype, "serviceStatus");
    return RegisterInput;
}());
exports.RegisterInput = RegisterInput;
