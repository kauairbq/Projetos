import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(organizationId: string) {
    const activeSubs = await this.prisma.subscription.findMany({
      where: {
        organizationId,
        status: { in: ["ACTIVE", "TRIALING"] },
      },
      include: { plan: true },
    });

    const mrr = activeSubs.reduce((total, sub) => {
      if (!sub.plan) return total;
      const monthly = sub.plan.interval === "YEARLY" ? sub.plan.priceCents / 12 : sub.plan.priceCents;
      return total + monthly;
    }, 0);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const canceledRecently = await this.prisma.subscription.count({
      where: {
        organizationId,
        status: "CANCELED",
        endDate: { gte: thirtyDaysAgo },
      },
    });

    const activeCount = activeSubs.length;
    const churnBase = activeCount + canceledRecently;
    const churnRate = churnBase > 0 ? (canceledRecently / churnBase) * 100 : 0;

    return {
      mrrCents: Math.round(mrr),
      activeSubscriptions: activeCount,
      canceledLast30Days: canceledRecently,
      churnRatePercent: Number(churnRate.toFixed(2)),
    };
  }
}
