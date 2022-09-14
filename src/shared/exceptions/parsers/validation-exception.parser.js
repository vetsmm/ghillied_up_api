"use strict";
exports.__esModule = true;
exports.validationExceptionParser = void 0;
var categories_1 = require("../categories");
var common_1 = require("@nestjs/common");
var base_api_exception_1 = require("../base-api.exception");
var validationExceptionParser = function (validationException) {
    function _parseTokens(errors) {
        var tokens = {};
        if (errors) {
            errors.forEach(function (error) {
                var property = error.property, constraints = error.constraints;
                var _a = Object.entries(constraints)[0], _ = _a[0], value = _a[1];
                tokens[property] = value;
            });
        }
        return tokens;
    }
    return base_api_exception_1.BaseApiException.builder()
        .withCategory(categories_1.GhilliedUpErrorCategories.DatabaseError)
        .withSubCategory(categories_1.GhilliedUpErrorCategories.ValidationError)
        .withMessage(categories_1.GhilliedUpErrorDetails.ValidationError)
        .withStatus(common_1.HttpStatus.BAD_REQUEST)
        .withContext(_parseTokens(validationException.errors))
        .build();
};
exports.validationExceptionParser = validationExceptionParser;
