import { Body, Controller, Post } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { PrismaService } from "../prisma/prisma.service";

@Controller("webhooks/billing")
export class BillingWebhooksController {
  constructor(
    private readonly payments: PaymentsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async handle(@Body() body: { event: string; invoiceId?: string; subscriptionId?: string }) {
    switch (body.event) {
      case "invoice.paid":
        if (!body.invoiceId) return { ok: false, message: "invoiceId obrigatório" };
        await this.payments.markInvoicePaid(body.invoiceId);
        return { ok: true };
      case "subscription.canceled":
        if (!body.subscriptionId) return { ok: false, message: "subscriptionId obrigatório" };
        await this.prisma.subscription.update({
          where: { id: body.subscriptionId },
          data: { status: "CANCELED", endDate: new Date() },
        });
        return { ok: true };
      default:
        return { ok: false, message: "Evento não suportado" };
    }
  }
}
