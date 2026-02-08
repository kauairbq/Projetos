import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../prisma/prisma.service";
import { PLAN_FEATURE_KEY, PlanFeature } from "../decorators/plan-feature.decorator";

@Injectable()
export class PlanFeatureGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.getAllAndOverride<PlanFeature>(
      PLAN_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!feature) return true;

    const request = context.switchToHttp().getRequest();
    const orgId = request.organizationId as string | undefined;

    if (!orgId) {
      throw new ForbiddenException("Organização não definida");
    }

    const subscription = await this.prisma.subscription.findFirst({
      where: {
        organizationId: orgId,
        status: { in: ["ACTIVE", "TRIALING"] },
      },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription?.plan) {
      throw new ForbiddenException("Plano não encontrado para a organização");
    }

    if (!subscription.plan[feature]) {
      throw new ForbiddenException("Funcionalidade indisponível no seu plano");
    }

    return true;
  }
}
