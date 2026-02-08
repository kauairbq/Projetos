import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { PlansService } from "./plans.service";
import { CreatePlanDto } from "./dto/create-plan.dto";
import { UpdatePlanDto } from "./dto/update-plan.dto";

@Controller("plans")
export class PlansController {
  constructor(private readonly plans: PlansService) {}

  @Post()
  create(@Body() dto: CreatePlanDto) {
    return this.plans.create(dto);
  }

  @Get()
  findAll() {
    return this.plans.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.plans.findOne(id);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() dto: UpdatePlanDto) {
    return this.plans.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.plans.remove(id);
  }
}
