import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { BillingIntervalDto } from "./create-plan.dto";

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceCents?: number;

  @IsOptional()
  @IsEnum(BillingIntervalDto)
  interval?: BillingIntervalDto;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsers?: number;

  @IsOptional()
  @IsBoolean()
  canExport?: boolean;

  @IsOptional()
  @IsBoolean()
  advancedReports?: boolean;
}
