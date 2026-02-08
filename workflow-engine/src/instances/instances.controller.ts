import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { InstancesService } from "./instances.service";

@Controller("instances")
export class InstancesController {
  constructor(private readonly service: InstancesService) {}

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @Post(":id/transition")
  transition(@Param("id") id: string, @Body() body: any) {
    return this.service.transition(id, body);
  }

  @Get(":id/events")
  events(@Param("id") id: string) {
    return this.service.events(id);
  }
}
