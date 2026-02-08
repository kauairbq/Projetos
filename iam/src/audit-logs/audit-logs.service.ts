import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.auditLog.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });
  }

  create(tenantId: string, action: string, actorId?: string, metadata?: any) {
    return this.prisma.auditLog.create({
      data: { tenantId, action, actorId, metadata },
    });
  }
}
