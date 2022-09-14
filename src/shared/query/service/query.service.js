"use strict";
exports.__esModule = true;
exports.QueryService = void 0;
var QueryService = /** @class */ (function () {
    function QueryService() {
    }
    QueryService.prototype.generatePrismaWhereQuery = function (query) {
        // Take all the keys in the object, and generate a where clause with AND for each key
        // e.g. { id: { equals: 1 } } => { where: { id: { equals: 1 } } }
        var where = { AND: [] };
        Object.keys(query).forEach(function (key) {
            var _a;
            where.AND.push((_a = {}, _a[key] = query[key], _a));
        });
        return { where: where };
    };
    return QueryService;
}());
exports.QueryService = QueryService;
