import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

export enum PaymentStatusDto {
  PENDING = "PENDING",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export class CreatePaymentDto {
  @IsString()
  invoiceId: string;

  @IsInt()
  @Min(0)
  amountCents: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(PaymentStatusDto)
  status?: PaymentStatusDto;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  externalRef?: string;
}

export class UpdatePaymentDto {
  @IsOptional()
  @IsEnum(PaymentStatusDto)
  status?: PaymentStatusDto;
}
