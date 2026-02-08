import { Module } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";
import { AuditLogsModule } from "../audit-logs/audit-logs.module";
import { BillingWebhooksController } from "./billing-webhooks.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [AuditLogsModule, PrismaModule],
  providers: [PaymentsService],
  controllers: [PaymentsController, BillingWebhooksController],
})
export class PaymentsModule {}
