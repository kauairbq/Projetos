import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePaymentDto, PaymentStatusDto, UpdatePaymentDto } from "./dto/payment.dto";
import { AuditLogsService } from "../audit-logs/audit-logs.service";

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async create(dto: CreatePaymentDto, organizationId: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: dto.invoiceId } });
    if (!invoice) {
      throw new NotFoundException("Fatura não encontrada");
    }

    if (invoice.organizationId !== organizationId) {
      throw new ForbiddenException("Fatura não pertence à organização");
    }

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId: dto.invoiceId,
        amountCents: dto.amountCents,
        currency: dto.currency ?? undefined,
        status: dto.status ?? undefined,
        provider: dto.provider ?? undefined,
        externalRef: dto.externalRef ?? undefined,
      },
      include: { invoice: true },
    });

    if (payment.status === PaymentStatusDto.SUCCEEDED) {
      await this.markInvoicePaid(invoice.id);
    }

    await this.auditLogs.logAction({
      organizationId: invoice.organizationId,
      action: "payment.created",
      metadata: { paymentId: payment.id, invoiceId: invoice.id, status: payment.status },
    });

    return payment;
  }

  list(organizationId: string) {
    return this.prisma.payment.findMany({
      where: { invoice: { organizationId } },
      include: { invoice: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, dto: UpdatePaymentDto, organizationId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { invoice: true },
    });
    if (!payment) {
      throw new NotFoundException("Pagamento não encontrado");
    }

    if (payment.invoice.organizationId !== organizationId) {
      throw new ForbiddenException("Pagamento não pertence à organização");
    }

    const updated = await this.prisma.payment.update({
      where: { id },
      data: { status: dto.status ?? undefined },
      include: { invoice: true },
    });

    if (dto.status === PaymentStatusDto.SUCCEEDED) {
      await this.markInvoicePaid(payment.invoiceId);
    }

    await this.auditLogs.logAction({
      organizationId: updated.invoice.organizationId,
      action: "payment.updated",
      metadata: { paymentId: updated.id, status: updated.status },
    });

    return updated;
  }

  async markInvoicePaid(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) {
      throw new NotFoundException("Fatura não encontrada");
    }

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAID", paidAt: new Date() },
    });
  }
}
