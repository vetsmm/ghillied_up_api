"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.DateTimeFilter = exports.NestedDateTimeFilter = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var NestedDateTimeFilter = /** @class */ (function () {
    function NestedDateTimeFilter() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)(),
        (0, swagger_1.ApiProperty)({
            oneOf: [{ type: 'string', format: 'date-time' }]
        })
    ], NestedDateTimeFilter.prototype, "equals");
    __decorate([
        (0, class_validator_1.IsOptional)(),
        (0, swagger_1.ApiProperty)({
            oneOf: [
                { type: 'string', format: 'date-time' },
                {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'date-time'
                    }
                },
            ]
        })
    ], NestedDateTimeFilter.prototype, "in");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [
                { type: 'string' },
                {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'date-time'
                    }
                },
            ]
        }),
        (0, class_validator_1.IsOptional)()
    ], NestedDateTimeFilter.prototype, "notIn");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [{ type: 'string', format: 'date-time' }]
        }),
        (0, class_validator_1.IsOptional)()
    ], NestedDateTimeFilter.prototype, "lt");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [{ type: 'string', format: 'date-time' }]
        }),
        (0, class_validator_1.IsOptional)()
    ], NestedDateTimeFilter.prototype, "lte");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [{ type: 'string', format: 'date-time' }]
        }),
        (0, class_validator_1.IsOptional)()
    ], NestedDateTimeFilter.prototype, "gt");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [{ type: 'string', format: 'date-time' }]
        }),
        (0, class_validator_1.IsOptional)()
    ], NestedDateTimeFilter.prototype, "gte");
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsOptional)()
    ], NestedDateTimeFilter.prototype, "not");
    return NestedDateTimeFilter;
}());
exports.NestedDateTimeFilter = NestedDateTimeFilter;
var DateTimeFilter = /** @class */ (function () {
    function DateTimeFilter() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [{ type: 'string', format: 'date-time' }]
        }),
        (0, class_validator_1.IsOptional)()
    ], DateTimeFilter.prototype, "equals");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [
                { type: 'string' },
                {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'date-time'
                    }
                },
            ]
        }),
        (0, class_validator_1.IsOptional)()
    ], DateTimeFilter.prototype, "in");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [
                { type: 'string' },
                {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'date-time'
                    }
                },
            ]
        }),
        (0, class_validator_1.IsOptional)()
    ], DateTimeFilter.prototype, "notIn");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [{ type: 'string', format: 'date-time' }]
        }),
        (0, class_validator_1.IsOptional)()
    ], DateTimeFilter.prototype, "lt");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [{ type: 'string', format: 'date-time' }]
        }),
        (0, class_validator_1.IsOptional)()
    ], DateTimeFilter.prototype, "lte");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [{ type: 'string', format: 'date-time' }]
        }),
        (0, class_validator_1.IsOptional)()
    ], DateTimeFilter.prototype, "gt");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [{ type: 'string', format: 'date-time' }]
        }),
        (0, class_validator_1.IsOptional)()
    ], DateTimeFilter.prototype, "gte");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [
                { type: 'string', format: 'date-time' },
                { type: 'object', $ref: 'NestedDateTimeFilter' },
            ]
        }),
        (0, class_validator_1.IsOptional)()
    ], DateTimeFilter.prototype, "not");
    return DateTimeFilter;
}());
exports.DateTimeFilter = DateTimeFilter;
