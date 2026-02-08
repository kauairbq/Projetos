import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

export enum InvoiceStatusDto {
  DRAFT = "DRAFT",
  OPEN = "OPEN",
  PAID = "PAID",
  VOID = "VOID",
  OVERDUE = "OVERDUE",
}

export class CreateInvoiceDto {
  @IsString()
  organizationId: string;

  @IsString()
  subscriptionId: string;

  @IsInt()
  @Min(0)
  amountCents: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(InvoiceStatusDto)
  status?: InvoiceStatusDto;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsDateString()
  paidAt?: string;
}
