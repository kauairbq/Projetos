import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrganizationDto, UpdateOrganizationDto } from "./dto/organization.dto";
import { AuditLogsService } from "../audit-logs/audit-logs.service";

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async create(dto: CreateOrganizationDto) {
    const org = await this.prisma.organization.create({ data: dto });
    await this.auditLogs.logAction({
      organizationId: org.id,
      action: "organization.created",
      metadata: { name: org.name },
    });
    return org;
  }

  findAll() {
    return this.prisma.organization.findMany({
      include: { members: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: { members: { include: { user: true } } },
    });
    if (!org) {
      throw new NotFoundException("Organização não encontrada");
    }
    return org;
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    await this.findOne(id);
    const updated = await this.prisma.organization.update({ where: { id }, data: dto });
    await this.auditLogs.logAction({
      organizationId: updated.id,
      action: "organization.updated",
      metadata: { name: updated.name },
    });
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.auditLogs.logAction({
      organizationId: id,
      action: "organization.deleted",
      metadata: {},
    });
    return this.prisma.organization.delete({ where: { id } });
  }
}
