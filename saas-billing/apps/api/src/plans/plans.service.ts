import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePlanDto } from "./dto/create-plan.dto";
import { UpdatePlanDto } from "./dto/update-plan.dto";

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreatePlanDto) {
    return this.prisma.plan.create({ data: dto });
  }

  findAll() {
    return this.prisma.plan.findMany({ orderBy: { createdAt: "desc" } });
  }

  findOne(id: string) {
    return this.prisma.plan.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdatePlanDto) {
    return this.prisma.plan.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.plan.delete({ where: { id } });
  }
}
