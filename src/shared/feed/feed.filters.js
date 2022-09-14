"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.FeedFilters = exports.PostStatusFilter = exports.NestedEnumPostStatusFilter = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var client_1 = require("@prisma/client");
var query_1 = require("../query");
var NestedEnumPostStatusFilter = /** @class */ (function () {
    function NestedEnumPostStatusFilter() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsEnum)(client_1.PostStatus),
        (0, class_validator_1.IsOptional)()
    ], NestedEnumPostStatusFilter.prototype, "equals");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [
                { type: 'enum', $ref: 'PostStatus' },
                {
                    type: 'array',
                    items: {
                        type: 'enum',
                        $ref: 'PostStatus'
                    }
                },
            ]
        }),
        (0, class_validator_1.IsEnum)(client_1.PostStatus),
        (0, class_validator_1.IsOptional)()
    ], NestedEnumPostStatusFilter.prototype, "in");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [
                { type: 'enum', $ref: 'PostStatus' },
                {
                    type: 'array',
                    items: {
                        type: 'enum',
                        $ref: 'PostStatus'
                    }
                },
            ]
        }),
        (0, class_validator_1.IsOptional)()
    ], NestedEnumPostStatusFilter.prototype, "notIn");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [
                { type: 'enum', $ref: 'PostStatus' },
                {
                    type: 'object',
                    $ref: 'NestedEnumPostStatusFilter'
                },
            ]
        }),
        (0, class_validator_1.IsOptional)()
    ], NestedEnumPostStatusFilter.prototype, "not");
    return NestedEnumPostStatusFilter;
}());
exports.NestedEnumPostStatusFilter = NestedEnumPostStatusFilter;
var PostStatusFilter = /** @class */ (function () {
    function PostStatusFilter() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)(),
        (0, class_validator_1.IsEnum)(client_1.PostStatus),
        (0, class_validator_1.IsOptional)()
    ], PostStatusFilter.prototype, "equals");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [
                { type: 'enum', $ref: 'PostStatus' },
                {
                    type: 'array',
                    items: {
                        type: 'enum',
                        $ref: 'PostStatus'
                    }
                },
            ]
        }),
        (0, class_validator_1.IsOptional)()
    ], PostStatusFilter.prototype, "in");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [
                { type: 'enum', $ref: 'PostStatus' },
                {
                    type: 'array',
                    items: {
                        type: 'enum',
                        $ref: 'PostStatus'
                    }
                },
            ]
        }),
        (0, class_validator_1.IsOptional)()
    ], PostStatusFilter.prototype, "notIn");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [
                { type: 'enum', $ref: 'PostStatus' },
                {
                    type: 'object',
                    $ref: 'NestedEnumPostStatusFilter'
                },
            ]
        }),
        (0, class_validator_1.IsOptional)()
    ], PostStatusFilter.prototype, "not");
    return PostStatusFilter;
}());
exports.PostStatusFilter = PostStatusFilter;
var FeedFilters = /** @class */ (function () {
    function FeedFilters() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({
            type: function () { return query_1.StringFilter; }
        }),
        (0, class_validator_1.IsOptional)()
    ], FeedFilters.prototype, "id");
    __decorate([
        (0, swagger_1.ApiProperty)({
            type: function () { return query_1.StringFilter; }
        }),
        (0, class_validator_1.IsOptional)()
    ], FeedFilters.prototype, "uid");
    __decorate([
        (0, swagger_1.ApiProperty)({
            type: function () { return query_1.StringFilter; }
        }),
        (0, class_validator_1.IsOptional)()
    ], FeedFilters.prototype, "title");
    __decorate([
        (0, swagger_1.ApiProperty)({
            type: function () { return query_1.StringFilter; }
        }),
        (0, class_validator_1.IsOptional)()
    ], FeedFilters.prototype, "content");
    __decorate([
        (0, swagger_1.ApiProperty)({
            type: function () { return query_1.StringFilter; }
        }),
        (0, class_validator_1.IsOptional)()
    ], FeedFilters.prototype, "ghillieId");
    __decorate([
        (0, swagger_1.ApiProperty)({
            type: function () { return query_1.StringFilter; }
        }),
        (0, class_validator_1.IsOptional)()
    ], FeedFilters.prototype, "postedById");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [
                { type: 'enum', $ref: 'PostStatus', "enum": Object.values(client_1.PostStatus) },
                {
                    type: 'object',
                    $ref: 'PostStatusFilter'
                },
            ]
        }),
        (0, class_validator_1.IsOptional)()
    ], FeedFilters.prototype, "status");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [
                { type: 'string', format: 'date-time' },
                {
                    type: 'object',
                    $ref: 'DateTimeFilter'
                },
            ]
        }),
        (0, class_validator_1.IsOptional)()
    ], FeedFilters.prototype, "createdDate");
    __decorate([
        (0, swagger_1.ApiProperty)({
            oneOf: [
                { type: 'string', format: 'date-time' },
                {
                    type: 'object',
                    $ref: 'DateTimeFilter'
                },
            ]
        }),
        (0, class_validator_1.IsOptional)()
    ], FeedFilters.prototype, "updatedDate");
    return FeedFilters;
}());
exports.FeedFilters = FeedFilters;
