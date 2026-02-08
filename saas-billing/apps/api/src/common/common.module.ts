import { Global, Module } from "@nestjs/common";
import { OrganizationGuard } from "./guards/organization.guard";
import { RolesGuard } from "./guards/roles.guard";
import { PlanFeatureGuard } from "./guards/plan-feature.guard";

@Global()
@Module({
  providers: [OrganizationGuard, RolesGuard, PlanFeatureGuard],
  exports: [OrganizationGuard, RolesGuard, PlanFeatureGuard],
})
export class CommonModule {}
