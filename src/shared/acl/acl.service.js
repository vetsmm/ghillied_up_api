"use strict";
exports.__esModule = true;
exports.BaseAclService = void 0;
var action_constant_1 = require("./action.constant");
var BaseAclService = /** @class */ (function () {
    function BaseAclService() {
        var _this = this;
        /**
         * ACL rules
         */
        this.aclRules = [];
        /**
         * create users specific acl object to check ability to perform any action
         */
        this.forActor = function (actor) {
            return {
                canDoAction: function (action, resource) {
                    var canDoAction = false;
                    actor.authorities.forEach(function (actorRole) {
                        //If already has access, return
                        if (canDoAction)
                            return true;
                        //find all rules for given users role
                        // const aclRules = this.aclRules.filter(
                        //   (rule) => rule.authorities === actorRole,
                        // );
                        var aclRules = _this.aclRules.filter(function (rule) {
                            return rule.authorities.includes(actorRole);
                        });
                        //for each rule, check action permission
                        aclRules.forEach(function (aclRule) {
                            //If already has access, return
                            if (canDoAction)
                                return true;
                            //check action permission
                            var hasActionPermission = aclRule.actions.includes(action) ||
                                aclRule.actions.includes(action_constant_1.Action.Manage);
                            //check for custom `ruleCallback` callback
                            canDoAction =
                                hasActionPermission &&
                                    (!aclRule.ruleCallback || aclRule.ruleCallback(resource, actor));
                        });
                    });
                    return canDoAction;
                }
            };
        };
    }
    /**
     * Set ACL rule for a role
     */
    BaseAclService.prototype.canDo = function (authorities, actions, ruleCallback) {
        // if authorities is not an array, make it one
        if (!Array.isArray(authorities)) {
            authorities = [authorities];
        }
        ruleCallback
            ? this.aclRules.push({ authorities: authorities, actions: actions, ruleCallback: ruleCallback })
            : this.aclRules.push({ authorities: authorities, actions: actions });
    };
    return BaseAclService;
}());
exports.BaseAclService = BaseAclService;
