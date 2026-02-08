import { Body, Controller, Get, Post, UseGuards, Req } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RolesService } from "./roles.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { TenantGuard } from "../common/guards/tenant.guard";

@Controller("roles")
@UseGuards(AuthGuard("jwt"), TenantGuard)
export class RolesController {
  constructor(private roles: RolesService) {}

  @Get()
  list(@Req() req: any) {
    return this.roles.list(req.tenantId);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateRoleDto) {
    return this.roles.create(req.tenantId, dto.name);
  }
}
