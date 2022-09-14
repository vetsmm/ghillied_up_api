"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.BaseApiExceptionBuilder = exports.BaseApiException = void 0;
var common_1 = require("@nestjs/common");
var BaseApiException = /** @class */ (function (_super) {
    __extends(BaseApiException, _super);
    function BaseApiException(message, status, localizedMessage, category, subCategory, context) {
        var _this = 
        // Calling parent constructor of base Exception class.
        _super.call(this, message, status) || this;
        _this.name = BaseApiException.name;
        _this.localizedMessage = localizedMessage;
        _this.category = category;
        _this.subCategory = subCategory;
        _this.context = context;
        return _this;
    }
    BaseApiException.builder = function () {
        return new BaseApiExceptionBuilder();
    };
    return BaseApiException;
}(common_1.HttpException));
exports.BaseApiException = BaseApiException;
var BaseApiExceptionBuilder = /** @class */ (function () {
    function BaseApiExceptionBuilder() {
        this.message = 'Internal server error';
        this.status = 500;
        this.localizedMessage = {};
        this.category = '';
        this.subCategory = '';
        this.context = {};
    }
    BaseApiExceptionBuilder.prototype.withMessage = function (message) {
        this.message = message;
        return this;
    };
    BaseApiExceptionBuilder.prototype.withStatus = function (status) {
        this.status = status;
        return this;
    };
    BaseApiExceptionBuilder.prototype.withLocalizedMessage = function (localizedMessage) {
        this.localizedMessage = localizedMessage;
        return this;
    };
    BaseApiExceptionBuilder.prototype.withCategory = function (category) {
        this.category = category;
        return this;
    };
    BaseApiExceptionBuilder.prototype.withSubCategory = function (subCategory) {
        this.subCategory = subCategory;
        return this;
    };
    BaseApiExceptionBuilder.prototype.withContext = function (context) {
        this.context = context;
        return this;
    };
    BaseApiExceptionBuilder.prototype.withBaseApiException = function (baseApiException) {
        this.message = baseApiException.message;
        this.status = baseApiException.getStatus();
        this.localizedMessage = baseApiException.localizedMessage;
        this.category = baseApiException.category;
        this.subCategory = baseApiException.subCategory;
        this.context = baseApiException.context;
        return this;
    };
    BaseApiExceptionBuilder.prototype.build = function () {
        return new BaseApiException(this.message, this.status, this.localizedMessage, this.category, this.subCategory, this.context);
    };
    return BaseApiExceptionBuilder;
}());
exports.BaseApiExceptionBuilder = BaseApiExceptionBuilder;
