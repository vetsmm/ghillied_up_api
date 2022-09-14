"use strict";
exports.__esModule = true;
exports.Authorities = exports.AUTHORITIES_KEY = void 0;
var common_1 = require("@nestjs/common");
exports.AUTHORITIES_KEY = 'authorities';
var Authorities = function () {
    var authorities = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        authorities[_i] = arguments[_i];
    }
    return (0, common_1.SetMetadata)(exports.AUTHORITIES_KEY, authorities);
};
exports.Authorities = Authorities;
