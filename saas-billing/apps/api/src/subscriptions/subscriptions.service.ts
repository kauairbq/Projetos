import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSubscriptionDto, SubscriptionStatusDto } from "./dto/create-subscription.dto";
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto";
import { AuditLogsService } from "../audit-logs/audit-logs.service";

const STATUS_TRANSITIONS: Record<SubscriptionStatusDto, SubscriptionStatusDto[]> = {
  TRIALING: ["ACTIVE", "CANCELED"],
  ACTIVE: ["PAST_DUE", "SUSPENDED", "CANCELED"],
  PAST_DUE: ["ACTIVE", "SUSPENDED", "CANCELED"],
  SUSPENDED: ["ACTIVE", "CANCELED"],
  CANCELED: [],
};

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async create(dto: CreateSubscriptionDto) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: dto.organizationId },
    });
    if (!organization) {
      throw new NotFoundException("Organização não encontrada");
    }

    const plan = await this.prisma.plan.findUnique({ where: { id: dto.planId } });
    if (!plan) {
      throw new NotFoundException("Plano não encontrado");
    }

    const created = await this.prisma.subscription.create({
      data: {
        organizationId: dto.organizationId,
        planId: dto.planId,
        status: dto.status ?? undefined,
        trialEndsAt: dto.trialEndsAt ? new Date(dto.trialEndsAt) : undefined,
        currentPeriodEnd: dto.currentPeriodEnd ? new Date(dto.currentPeriodEnd) : undefined,
      },
      include: { organization: true, plan: true },
    });

    await this.auditLogs.logAction({
      organizationId: dto.organizationId,
      action: "subscription.created",
      metadata: { subscriptionId: created.id, planId: dto.planId, status: created.status },
    });

    return created;
  }

  findAll() {
    return this.prisma.subscription.findMany({
      include: { organization: true, plan: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: { organization: true, plan: true },
    });

    if (!subscription) {
      throw new NotFoundException("Subscrição não encontrada");
    }

    return subscription;
  }

  async update(id: string, dto: UpdateSubscriptionDto) {
    const current = await this.findOne(id);

    if (dto.status && dto.status !== current.status) {
      const allowed = STATUS_TRANSITIONS[current.status as SubscriptionStatusDto] ?? [];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(
          `Transição inválida de ${current.status} para ${dto.status}`,
        );
      }
    }

    const updated = await this.prisma.subscription.update({
      where: { id },
      data: {
        organizationId: dto.organizationId ?? undefined,
        planId: dto.planId ?? undefined,
        status: dto.status ?? undefined,
        trialEndsAt: dto.trialEndsAt ? new Date(dto.trialEndsAt) : undefined,
        currentPeriodEnd: dto.currentPeriodEnd ? new Date(dto.currentPeriodEnd) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        cancelAt: dto.cancelAt ? new Date(dto.cancelAt) : undefined,
      },
      include: { organization: true, plan: true },
    });

    await this.auditLogs.logAction({
      organizationId: updated.organizationId,
      action: "subscription.updated",
      metadata: { subscriptionId: updated.id, status: updated.status },
    });

    return updated;
  }

  async remove(id: string) {
    const current = await this.findOne(id);
    await this.auditLogs.logAction({
      organizationId: current.organizationId,
      action: "subscription.deleted",
      metadata: { subscriptionId: current.id },
    });
    return this.prisma.subscription.delete({ where: { id } });
  }
}
