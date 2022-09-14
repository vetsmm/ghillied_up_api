"use strict";
exports.__esModule = true;
var config_1 = require("@nestjs/config");
exports["default"] = (0, config_1.registerAs)('slugify', function () { return ({
    replacement: '-',
    lower: true,
    remove: /[*+~.()'"!:@]/g
}); });
