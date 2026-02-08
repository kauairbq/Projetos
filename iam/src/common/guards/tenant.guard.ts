import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantKey = request.headers["x-tenant-id"] ?? request.headers["x-tenant"];

    if (!tenantKey || Array.isArray(tenantKey)) {
      throw new ForbiddenException("Header x-tenant-id obrigatorio");
    }

    const tenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [{ id: tenantKey }, { slug: tenantKey }],
      },
    });

    if (!tenant) {
      throw new ForbiddenException("Tenant invalido");
    }

    request.tenantId = tenant.id;
    return true;
  }
}
