import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";

export enum SubscriptionStatusDto {
  TRIALING = "TRIALING",
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  SUSPENDED = "SUSPENDED",
  CANCELED = "CANCELED",
}

export class CreateSubscriptionDto {
  @IsString()
  organizationId: string;

  @IsString()
  planId: string;

  @IsOptional()
  @IsEnum(SubscriptionStatusDto)
  status?: SubscriptionStatusDto;

  @IsOptional()
  @IsDateString()
  trialEndsAt?: string;

  @IsOptional()
  @IsDateString()
  currentPeriodEnd?: string;
}
