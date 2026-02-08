import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { OrganizationUsersService } from "./organization-users.service";
import { AddOrganizationUserDto } from "./dto/organization-user.dto";
import { OrganizationGuard } from "../common/guards/organization.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { OrganizationRole } from "@prisma/client";

@Controller("organizations/:organizationId/users")
@UseGuards(AuthGuard("jwt"), OrganizationGuard, RolesGuard)
export class OrganizationUsersController {
  constructor(private readonly organizationUsersService: OrganizationUsersService) {}

  @Get()
  @Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  list(@Param("organizationId") organizationId: string) {
    return this.organizationUsersService.listByOrganization(organizationId);
  }

  @Post()
  @Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  add(
    @Param("organizationId") organizationId: string,
    @Body() dto: AddOrganizationUserDto,
    @Req() req: { user?: { id: string } },
  ) {
    return this.organizationUsersService.addMember(organizationId, dto, req.user?.id);
  }

  @Delete(":userId")
  @Roles(OrganizationRole.OWNER)
  remove(
    @Param("organizationId") organizationId: string,
    @Param("userId") userId: string,
    @Req() req: { user?: { id: string } },
  ) {
    return this.organizationUsersService.removeMember(organizationId, userId, req.user?.id);
  }
}
