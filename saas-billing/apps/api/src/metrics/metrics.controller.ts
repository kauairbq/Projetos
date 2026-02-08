import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { MetricsService } from "./metrics.service";
import { OrganizationId } from "../common/decorators/organization-id.decorator";
import { OrganizationGuard } from "../common/guards/organization.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { OrganizationRole } from "@prisma/client";

@Controller("metrics")
@UseGuards(AuthGuard("jwt"), OrganizationGuard, RolesGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  get(@OrganizationId() organizationId: string) {
    return this.metricsService.getMetrics(organizationId);
  }
}
