"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.StringFilter = exports.NestedStringFilter = exports.NestedStringNullableFilter = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var NestedStringNullableFilter = /** @class */ (function () {
    function NestedStringNullableFilter() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], NestedStringNullableFilter.prototype, "equals");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [
                { type: 'string' },
                {
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                },
            ]
        }),
        (0, class_validator_1.IsOptional)()
    ], NestedStringNullableFilter.prototype, "in");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [
                { type: 'string' },
                {
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                },
            ]
        }),
        (0, class_validator_1.IsOptional)()
    ], NestedStringNullableFilter.prototype, "notIn");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], NestedStringNullableFilter.prototype, "lt");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], NestedStringNullableFilter.prototype, "lte");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], NestedStringNullableFilter.prototype, "gt");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], NestedStringNullableFilter.prototype, "gte");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], NestedStringNullableFilter.prototype, "contains");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], NestedStringNullableFilter.prototype, "startsWith");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], NestedStringNullableFilter.prototype, "endsWith");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], NestedStringNullableFilter.prototype, "search");
    __decorate([
        (0, swagger_1.ApiProperty)({
            type: function () { return NestedStringNullableFilter; }
        }),
        (0, class_validator_1.IsOptional)()
    ], NestedStringNullableFilter.prototype, "not");
    return NestedStringNullableFilter;
}());
exports.NestedStringNullableFilter = NestedStringNullableFilter;
var NestedStringFilter = /** @class */ (function () {
    function NestedStringFilter() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], NestedStringFilter.prototype, "equals");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [
                { type: 'string' },
                {
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                },
            ]
        }),
        (0, class_validator_1.IsOptional)()
    ], NestedStringFilter.prototype, "in");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [
                { type: 'string' },
                {
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                },
            ]
        }),
        (0, class_validator_1.IsOptional)()
    ], NestedStringFilter.prototype, "notIn");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], NestedStringFilter.prototype, "lt");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], NestedStringFilter.prototype, "lte");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], NestedStringFilter.prototype, "gt");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], NestedStringFilter.prototype, "gte");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], NestedStringFilter.prototype, "contains");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], NestedStringFilter.prototype, "startsWith");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], NestedStringFilter.prototype, "endsWith");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], NestedStringFilter.prototype, "search");
    __decorate([
        (0, swagger_1.ApiProperty)({
            type: function () { return NestedStringNullableFilter; }
        }),
        (0, class_validator_1.IsOptional)()
    ], NestedStringFilter.prototype, "not");
    return NestedStringFilter;
}());
exports.NestedStringFilter = NestedStringFilter;
var StringFilter = /** @class */ (function () {
    function StringFilter() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], StringFilter.prototype, "equals");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [
                { type: 'string' },
                {
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                },
            ]
        }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], StringFilter.prototype, "in");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [
                { type: 'string' },
                {
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                },
            ]
        }),
        (0, class_validator_1.IsOptional)()
    ], StringFilter.prototype, "notIn");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], StringFilter.prototype, "lt");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], StringFilter.prototype, "lte");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], StringFilter.prototype, "gt");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], StringFilter.prototype, "gte");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], StringFilter.prototype, "contains");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], StringFilter.prototype, "startsWith");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], StringFilter.prototype, "endsWith");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], StringFilter.prototype, "search");
    __decorate([
        (0, swagger_1.ApiProperty)({
            type: function () { return NestedStringNullableFilter; }
        }),
        (0, class_validator_1.IsOptional)()
    ], StringFilter.prototype, "not");
    return StringFilter;
}());
exports.StringFilter = StringFilter;
