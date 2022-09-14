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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.PostAclService = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
var shared_1 = require("../../shared");
var PostAclService = /** @class */ (function (_super) {
    __extends(PostAclService, _super);
    function PostAclService() {
        var _this = _super.call(this) || this;
        _this.canDo(client_1.UserAuthority.ROLE_ADMIN, [shared_1.Action.Manage]);
        // A user can post to a ghillie
        _this.canDo([client_1.UserAuthority.ROLE_USER, client_1.UserAuthority.ROLE_VERIFIED_MILITARY], [shared_1.Action.Create]);
        //users can read himself or any other users
        _this.canDo([client_1.UserAuthority.ROLE_USER, client_1.UserAuthority.ROLE_VERIFIED_MILITARY], [shared_1.Action.Read]);
        //users can read himself or any other users
        _this.canDo([client_1.UserAuthority.ROLE_USER, client_1.UserAuthority.ROLE_VERIFIED_MILITARY], [shared_1.Action.List]);
        // users can only update post if they are the owner
        _this.canDo([client_1.UserAuthority.ROLE_USER, client_1.UserAuthority.ROLE_VERIFIED_MILITARY], [shared_1.Action.Update], _this.isUserPostOwner);
        // Only an admin can do a hard delete
        _this.canDo(client_1.UserAuthority.ROLE_ADMIN, [shared_1.Action.Delete]);
        return _this;
    }
    PostAclService.prototype.isUserPostOwner = function (post, user) {
        return post.postedById === user.id;
    };
    PostAclService = __decorate([
        (0, common_1.Injectable)()
    ], PostAclService);
    return PostAclService;
}(shared_1.BaseAclService));
exports.PostAclService = PostAclService;
