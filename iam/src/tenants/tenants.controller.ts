import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { TenantsService } from "./tenants.service";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { InviteTenantUserDto } from "./dto/invite-tenant-user.dto";
import { AcceptInviteDto } from "./dto/accept-invite.dto";
import { UpdateTenantRoleDto } from "./dto/update-tenant-role.dto";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { TenantGuard } from "../common/guards/tenant.guard";

@Controller("tenants")
export class TenantsController {
  constructor(private readonly tenants: TenantsService) {}

  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.tenants.create(dto);
  }

  @UseGuards(AuthGuard("jwt"), TenantGuard, RolesGuard)
  @Post(":id/invite")
  @Roles("OWNER", "ADMIN")
  invite(@Param("id") id: string, @Body() dto: InviteTenantUserDto) {
    return this.tenants.invite(id, dto);
  }

  @Post("invite/accept")
  acceptInvite(@Body() dto: AcceptInviteDto) {
    return this.tenants.acceptInvite(dto);
  }

  @UseGuards(AuthGuard("jwt"), TenantGuard, RolesGuard)
  @Get(":id/users")
  @Roles("OWNER", "ADMIN")
  listUsers(@Param("id") id: string) {
    return this.tenants.listUsers(id);
  }

  @UseGuards(AuthGuard("jwt"), TenantGuard, RolesGuard)
  @Patch(":id/users/:userId/role")
  @Roles("OWNER")
  updateRole(@Param("id") id: string, @Param("userId") userId: string, @Body() dto: UpdateTenantRoleDto) {
    return this.tenants.updateRole(id, userId, dto);
  }
}
