import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ReportsService } from "./reports.service";
import { OrganizationGuard } from "../common/guards/organization.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { PlanFeatureGuard } from "../common/guards/plan-feature.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { RequiresPlanFeature } from "../common/decorators/plan-feature.decorator";
import { OrganizationRole } from "@prisma/client";

@Controller("reports")
@UseGuards(AuthGuard("jwt"), OrganizationGuard, RolesGuard, PlanFeatureGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("advanced")
  @Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  @RequiresPlanFeature("advancedReports")
  advanced() {
    return this.reportsService.getAdvancedReport();
  }

  @Get("export")
  @Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  @RequiresPlanFeature("canExport")
  exportData() {
    return this.reportsService.getExport();
  }
}
