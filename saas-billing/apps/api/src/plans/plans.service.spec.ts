import { Test, TestingModule } from "@nestjs/testing";
import { PlansService } from "./plans.service";
import { PrismaService } from "../prisma/prisma.service";

describe("PlansService", () => {
  let service: PlansService;

  const prismaMock = {
    plan: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  } as unknown as PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlansService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get(PlansService);
  });

  it("cria um plano", async () => {
    prismaMock.plan.create = jest.fn().mockResolvedValue({ id: "1" });
    const result = await service.create({
      name: "Starter",
      description: "",
      priceCents: 1000,
      interval: "MONTHLY" as any,
      active: true,
    });
    expect(result).toEqual({ id: "1" });
  });

  it("lista planos", async () => {
    prismaMock.plan.findMany = jest.fn().mockResolvedValue([{ id: "1" }]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });
});
