import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AddOrganizationUserDto } from "./dto/organization-user.dto";
import { AuditLogsService } from "../audit-logs/audit-logs.service";

@Injectable()
export class OrganizationUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async addMember(organizationId: string, dto: AddOrganizationUserDto, actorUserId?: string) {
    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) {
      throw new NotFoundException("Organização não encontrada");
    }

    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException("Utilizador não encontrado");
    }

    const subscription = await this.prisma.subscription.findFirst({
      where: {
        organizationId,
        status: { in: ["ACTIVE", "TRIALING"] },
      },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      throw new BadRequestException("Sem subscrição ativa para adicionar membros");
    }

    const memberCount = await this.prisma.organizationUser.count({
      where: { organizationId },
    });

    if (memberCount >= subscription.plan.maxUsers) {
      throw new BadRequestException("Limite de utilizadores do plano atingido");
    }

    const membership = await this.prisma.organizationUser.create({
      data: {
        organizationId,
        userId: dto.userId,
        role: dto.role,
      },
      include: { user: true, organization: true },
    });

    await this.auditLogs.logAction({
      organizationId,
      actorUserId: actorUserId ?? null,
      action: "organization_user.invited",
      metadata: {
        userId: dto.userId,
        role: dto.role,
      },
    });

    return membership;
  }

  listByOrganization(organizationId: string) {
    return this.prisma.organizationUser.findMany({
      where: { organizationId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async removeMember(organizationId: string, userId: string, actorUserId?: string) {
    const membership = await this.prisma.organizationUser.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
    });
    if (!membership) {
      throw new NotFoundException("Associação não encontrada");
    }

    const removed = await this.prisma.organizationUser.delete({
      where: { id: membership.id },
    });

    await this.auditLogs.logAction({
      organizationId,
      actorUserId: actorUserId ?? null,
      action: "organization_user.removed",
      metadata: { userId },
    });

    return removed;
  }
}
