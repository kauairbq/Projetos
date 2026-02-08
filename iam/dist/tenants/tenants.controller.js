"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsController = void 0;
const common_1 = require("@nestjs/common");
const tenants_service_1 = require("./tenants.service");
const create_tenant_dto_1 = require("./dto/create-tenant.dto");
const invite_tenant_user_dto_1 = require("./dto/invite-tenant-user.dto");
const accept_invite_dto_1 = require("./dto/accept-invite.dto");
const update_tenant_role_dto_1 = require("./dto/update-tenant-role.dto");
const passport_1 = require("@nestjs/passport");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const tenant_guard_1 = require("../common/guards/tenant.guard");
let TenantsController = class TenantsController {
    constructor(tenants) {
        this.tenants = tenants;
    }
    create(dto) {
        return this.tenants.create(dto);
    }
    invite(id, dto) {
        return this.tenants.invite(id, dto);
    }
    acceptInvite(dto) {
        return this.tenants.acceptInvite(dto);
    }
    listUsers(id) {
        return this.tenants.listUsers(id);
    }
    updateRole(id, userId, dto) {
        return this.tenants.updateRole(id, userId, dto);
    }
};
exports.TenantsController = TenantsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tenant_dto_1.CreateTenantDto]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt"), tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, common_1.Post)(":id/invite"),
    (0, roles_decorator_1.Roles)("OWNER", "ADMIN"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, invite_tenant_user_dto_1.InviteTenantUserDto]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "invite", null);
__decorate([
    (0, common_1.Post)("invite/accept"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [accept_invite_dto_1.AcceptInviteDto]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "acceptInvite", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt"), tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, common_1.Get)(":id/users"),
    (0, roles_decorator_1.Roles)("OWNER", "ADMIN"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "listUsers", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt"), tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, common_1.Patch)(":id/users/:userId/role"),
    (0, roles_decorator_1.Roles)("OWNER"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Param)("userId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_tenant_role_dto_1.UpdateTenantRoleDto]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "updateRole", null);
exports.TenantsController = TenantsController = __decorate([
    (0, common_1.Controller)("tenants"),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService])
], TenantsController);
//# sourceMappingURL=tenants.controller.js.map