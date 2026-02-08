import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.id) {
      throw new UnauthorizedException("Autenticação necessária");
    }

    const orgHeader =
      request.headers["x-organization-id"] ?? request.headers["x-organization"];

    if (!orgHeader || Array.isArray(orgHeader)) {
      throw new ForbiddenException("Cabeçalho x-organization-id obrigatório");
    }

    const orgIdParam = request.params?.organizationId;
    const orgKey = String(orgHeader);

    const organization = await this.prisma.organization.findFirst({
      where: {
        OR: [{ id: orgKey }, { slug: orgKey }],
      },
    });

    if (!organization) {
      throw new ForbiddenException("Organização inválida");
    }

    if (orgIdParam && orgIdParam !== organization.id && orgIdParam !== organization.slug) {
      throw new ForbiddenException("Organização do cabeçalho não corresponde ao parâmetro");
    }

    const membership = await this.prisma.organizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: organization.id,
        },
      },
      include: { organization: true },
    });

    if (!membership) {
      throw new ForbiddenException("Utilizador sem acesso à organização");
    }

    request.organizationId = organization.id;
    request.organizationRole = membership.role;

    return true;
  }
}
