import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { InviteTenantUserDto } from "./dto/invite-tenant-user.dto";
import { AcceptInviteDto } from "./dto/accept-invite.dto";
import { UpdateTenantRoleDto } from "./dto/update-tenant-role.dto";
import { randomUUID } from "crypto";
import { AuditLogsService } from "../audit-logs/audit-logs.service";

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService, private audit: AuditLogsService) {}

  async create(dto: CreateTenantDto) {
    const tenant = await this.prisma.tenant.create({ data: dto });
    await this.audit.create(tenant.id, "tenant.created", undefined, { slug: tenant.slug });
    return tenant;
  }

  async invite(tenantId: string, dto: InviteTenantUserDto) {
    const token = randomUUID();
    const invite = await this.prisma.tenantInvite.create({
      data: {
        tenantId,
        email: dto.email,
        token,
      },
    });
    await this.audit.create(tenantId, "tenant.invite", undefined, { email: dto.email });
    return invite;
  }

  async acceptInvite(dto: AcceptInviteDto) {
    const invite = await this.prisma.tenantInvite.findUnique({ where: { token: dto.token } });
    if (!invite) throw new NotFoundException("Convite invalido");

    const user = await this.prisma.user.findUnique({ where: { email: invite.email } });
    if (!user) throw new NotFoundException("Utilizador nao encontrado");

    await this.prisma.tenantUser.upsert({
      where: { tenantId_userId: { tenantId: invite.tenantId, userId: user.id } },
      update: {},
      create: { tenantId: invite.tenantId, userId: user.id, role: "MEMBER" },
    });

    await this.prisma.tenantInvite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    });

    await this.audit.create(invite.tenantId, "tenant.invite.accepted", user.id, { email: user.email });

    return { ok: true };
  }

  listUsers(tenantId: string) {
    return this.prisma.tenantUser.findMany({
      where: { tenantId },
      include: { user: true },
    });
  }

  async updateRole(tenantId: string, userId: string, dto: UpdateTenantRoleDto) {
    const membership = await this.prisma.tenantUser.findUnique({
      where: { tenantId_userId: { tenantId, userId } },
    });
    if (!membership) throw new NotFoundException("Utilizador nao pertence ao tenant");

    const updated = await this.prisma.tenantUser.update({
      where: { tenantId_userId: { tenantId, userId } },
      data: { role: dto.role as any },
    });

    await this.audit.create(tenantId, "tenant.role.updated", userId, { role: dto.role });

    return updated;
  }
}
