import { SetMetadata } from "@nestjs/common";

export const PLAN_FEATURE_KEY = "planFeature";

export type PlanFeature = "canExport" | "advancedReports";

export const RequiresPlanFeature = (feature: PlanFeature) =>
  SetMetadata(PLAN_FEATURE_KEY, feature);
