import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

export enum BillingIntervalDto {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  priceCents: number;

  @IsEnum(BillingIntervalDto)
  interval: BillingIntervalDto;

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
