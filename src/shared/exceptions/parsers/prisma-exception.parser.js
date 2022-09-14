"use strict";
exports.__esModule = true;
exports.prismaParsers = exports.buildError = void 0;
var categories_1 = require("../categories");
var base_api_exception_1 = require("../base-api.exception");
function buildError(prismaExcept) {
    function _parseTokens(prismaErrorCode, meta) {
        // Create a record where the key is an element in meta.target and the value is PrismaErrorDetails[prismaErrorCode].
        var tokens = {};
        if (meta && meta.target && meta.target instanceof Array) {
            for (var _i = 0, _a = meta.target; _i < _a.length; _i++) {
                var target = _a[_i];
                tokens[target] = categories_1.PrismaErrorDetails[prismaErrorCode];
            }
        }
        return tokens;
    }
    return base_api_exception_1.BaseApiException.builder()
        .withCategory(categories_1.GhilliedUpErrorCategories.DatabaseError)
        .withSubCategory(categories_1.PrismaErrorCategory[prismaExcept.code] ||
        categories_1.PrismaErrorCategory.UnhandledError)
        .withMessage(categories_1.PrismaErrorDetails[prismaExcept.code])
        .withStatus(categories_1.PrismaErrorCategory[prismaExcept.code] ? 400 : 500)
        .withContext(_parseTokens(prismaExcept.code, prismaExcept.meta))
        .build();
}
exports.buildError = buildError;
exports.prismaParsers = {
    buildError: buildError
};
