import { BadRequestException } from "@nestjs/common";
import { SubscriptionsService } from "./subscriptions.service";

const prismaMock = {
  organization: { findUnique: jest.fn() },
  plan: { findUnique: jest.fn() },
  subscription: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const auditMock = { logAction: jest.fn() };

describe("SubscriptionsService", () => {
  let service: SubscriptionsService;

  beforeEach(() => {
    service = new SubscriptionsService(prismaMock as any, auditMock as any);
  });

  it("should block invalid status transitions", async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({
      id: "sub-1",
      status: "CANCELED",
      organizationId: "org-1",
      planId: "plan-1",
    });

    await expect(
      service.update("sub-1", { status: "ACTIVE" } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("should allow valid status transitions", async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({
      id: "sub-2",
      status: "ACTIVE",
      organizationId: "org-1",
      planId: "plan-1",
    });

    prismaMock.subscription.update.mockResolvedValue({
      id: "sub-2",
      status: "PAST_DUE",
      organizationId: "org-1",
    });

    const result = await service.update("sub-2", { status: "PAST_DUE" } as any);
    expect(result.status).toBe("PAST_DUE");
  });
});
