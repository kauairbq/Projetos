import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.role.findMany({ where: { tenantId }, include: { permissions: true } });
  }

  create(tenantId: string, name: string) {
    return this.prisma.role.create({ data: { tenantId, name } });
  }
}
