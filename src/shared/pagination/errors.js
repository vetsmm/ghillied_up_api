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
exports.MissingPaginationBoundariesError = exports.InvalidPaginationError = void 0;
var InvalidPaginationError = /** @class */ (function (_super) {
    __extends(InvalidPaginationError, _super);
    function InvalidPaginationError(argumentName, connectionName) {
        var _this = _super.call(this, "`".concat(argumentName, "` on").concat(connectionName ? " the `".concat(connectionName, "` ") : ' ', "connection cannot be less than zero.")) || this;
        _this.argumentName = argumentName;
        _this.connectionName = connectionName;
        Object.setPrototypeOf(_this, InvalidPaginationError.prototype);
        _this.name = _this.constructor.name;
        return _this;
    }
    return InvalidPaginationError;
}(Error));
exports.InvalidPaginationError = InvalidPaginationError;
var MissingPaginationBoundariesError = /** @class */ (function (_super) {
    __extends(MissingPaginationBoundariesError, _super);
    function MissingPaginationBoundariesError(connectionName) {
        var _this = _super.call(this, "You must provide a `first` or `last` value to properly paginate".concat(connectionName ? " the `".concat(connectionName, "` ") : ' ', "connection.")) || this;
        _this.connectionName = connectionName;
        Object.setPrototypeOf(_this, MissingPaginationBoundariesError.prototype);
        _this.name = _this.constructor.name;
        return _this;
    }
    return MissingPaginationBoundariesError;
}(Error));
exports.MissingPaginationBoundariesError = MissingPaginationBoundariesError;
