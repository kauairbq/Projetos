import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuditLogsService } from "./audit-logs.service";
import { OrganizationId } from "../common/decorators/organization-id.decorator";
import { OrganizationGuard } from "../common/guards/organization.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { OrganizationRole } from "@prisma/client";

@Controller("audit-logs")
@UseGuards(AuthGuard("jwt"), OrganizationGuard, RolesGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  list(@OrganizationId() organizationId: string) {
    return this.auditLogsService.listByOrganization(organizationId);
  }
}
