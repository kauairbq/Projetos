import { BadRequestException, NotFoundException } from "@nestjs/common";
import { OrganizationUsersService } from "./organization-users.service";

const prismaMock = {
  organization: { findUnique: jest.fn() },
  user: { findUnique: jest.fn() },
  subscription: { findFirst: jest.fn() },
  organizationUser: {
    count: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
};

const auditMock = { logAction: jest.fn() };

describe("OrganizationUsersService", () => {
  let service: OrganizationUsersService;

  beforeEach(() => {
    service = new OrganizationUsersService(prismaMock as any, auditMock as any);
  });

  it("should reject when plan user limit is reached", async () => {
    prismaMock.organization.findUnique.mockResolvedValue({ id: "org-1" });
    prismaMock.user.findUnique.mockResolvedValue({ id: "user-2" });
    prismaMock.subscription.findFirst.mockResolvedValue({
      plan: { maxUsers: 1 },
    });
    prismaMock.organizationUser.count.mockResolvedValue(1);

    await expect(
      service.addMember("org-1", { userId: "user-2", role: "MEMBER" } as any, "admin"),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("should throw when organization does not exist", async () => {
    prismaMock.organization.findUnique.mockResolvedValue(null);

    await expect(
      service.addMember("org-x", { userId: "user-2", role: "MEMBER" } as any, "admin"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
