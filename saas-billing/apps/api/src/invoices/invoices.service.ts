import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
import { AuditLogsService } from "../audit-logs/audit-logs.service";

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async create(dto: CreateInvoiceDto) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: dto.organizationId },
    });
    if (!organization) {
      throw new NotFoundException("Organização não encontrada");
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: { id: dto.subscriptionId },
    });
    if (!subscription) {
      throw new NotFoundException("Subscrição não encontrada");
    }

    const invoice = await this.prisma.invoice.create({
      data: {
        organizationId: dto.organizationId,
        subscriptionId: dto.subscriptionId,
        amountCents: dto.amountCents,
        currency: dto.currency ?? undefined,
        status: dto.status ?? undefined,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
      },
      include: { organization: true, subscription: true },
    });

    await this.auditLogs.logAction({
      organizationId: dto.organizationId,
      action: "invoice.created",
      metadata: { invoiceId: invoice.id, amountCents: invoice.amountCents },
    });

    return invoice;
  }

  findAll() {
    return this.prisma.invoice.findMany({
      include: { organization: true, subscription: true },
      orderBy: { issuedAt: "desc" },
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { organization: true, subscription: true },
    });

    if (!invoice) {
      throw new NotFoundException("Fatura não encontrada");
    }

    return invoice;
  }

  async update(id: string, dto: UpdateInvoiceDto) {
    await this.findOne(id);

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        organizationId: dto.organizationId ?? undefined,
        subscriptionId: dto.subscriptionId ?? undefined,
        amountCents: dto.amountCents ?? undefined,
        currency: dto.currency ?? undefined,
        status: dto.status ?? undefined,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
      },
      include: { organization: true, subscription: true },
    });

    await this.auditLogs.logAction({
      organizationId: updated.organizationId,
      action: "invoice.updated",
      metadata: { invoiceId: updated.id, status: updated.status },
    });

    return updated;
  }

  async remove(id: string) {
    const current = await this.findOne(id);
    await this.auditLogs.logAction({
      organizationId: current.organizationId,
      action: "invoice.deleted",
      metadata: { invoiceId: current.id },
    });
    return this.prisma.invoice.delete({ where: { id } });
  }
}
