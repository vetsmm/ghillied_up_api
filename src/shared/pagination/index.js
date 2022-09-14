"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.parsePaginationArgs = void 0;
var errors_1 = require("./errors");
__exportStar(require("./errors"), exports);
__exportStar(require("./types"), exports);
var isNotNullish = function (value) {
    return typeof value !== 'undefined' && value !== null;
};
var getLastItem = function (value) { return value[value.length - 1]; };
var parsePaginationArgs = function (_a, _b) {
    var first = _a.first, after = _a.after, last = _a.last, before = _a.before;
    var _c = _b === void 0 ? {} : _b, connectionName = _c.connectionName;
    if (isNotNullish(first)) {
        if (first < 0) {
            throw new errors_1.InvalidPaginationError('first', connectionName);
        }
        var cursor = isNotNullish(after) ? { id: after } : undefined;
        var take_1 = first + 1; // include one extra item to set hasNextPage value
        var skip = isNotNullish(cursor) ? 1 : undefined; // prisma will include the cursor if skip: 1 is not set
        return {
            findManyArgs: { cursor: cursor, skip: skip, take: take_1 },
            toConnection: function (items) {
                var _a, _b, _c, _d;
                var copy = __spreadArray([], items, true); // avoid mutations on original array
                var hasNextPage = copy.length === take_1;
                if (hasNextPage) {
                    copy.pop();
                }
                return {
                    edges: copy.map(function (item) { return ({ cursor: item.id, node: item }); }),
                    pageInfo: {
                        hasNextPage: hasNextPage,
                        endCursor: (_b = (_a = getLastItem(copy)) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null,
                        hasPreviousPage: false,
                        startCursor: (_d = (_c = copy[0]) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : null
                    }
                };
            },
            toResponse: function (items) {
                var copy = __spreadArray([], items, true); // avoid mutations on original array
                if (copy.length === 0) {
                    return copy;
                }
                var hasNextPage = copy.length === take_1;
                if (hasNextPage) {
                    copy.pop();
                }
                return copy;
            }
        };
    }
    if (isNotNullish(last)) {
        if (last < 0) {
            throw new errors_1.InvalidPaginationError('last', connectionName);
        }
        var cursor = isNotNullish(before) ? { id: before } : undefined;
        var take_2 = last + 1; // include one extra item to set hasPreviousPage value
        var skip = isNotNullish(cursor) ? 1 : undefined; // prisma will include the cursor if skip: 1 is not set
        return {
            findManyArgs: { cursor: cursor, skip: skip, take: -take_2 },
            toConnection: function (items) {
                var _a, _b, _c, _d;
                var copy = __spreadArray([], items, true); // avoid mutations on original array
                var hasPreviousPage = copy.length === take_2;
                if (hasPreviousPage) {
                    copy.shift();
                }
                return {
                    edges: copy.map(function (item) { return ({ cursor: item.id, node: item }); }),
                    pageInfo: {
                        hasNextPage: false,
                        endCursor: (_b = (_a = getLastItem(copy)) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null,
                        hasPreviousPage: hasPreviousPage,
                        startCursor: (_d = (_c = copy[0]) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : null
                    }
                };
            },
            toResponse: function (items) {
                // avoid mutations on original array
                return __spreadArray([], items, true);
            }
        };
    }
    throw new errors_1.MissingPaginationBoundariesError(connectionName);
};
exports.parsePaginationArgs = parsePaginationArgs;
