import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { WorkflowsService } from "./workflows.service";

@Controller("workflows")
export class WorkflowsController {
  constructor(private readonly service: WorkflowsService) {}

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Post(":id/versions")
  createVersion(@Param("id") id: string, @Body() body: any) {
    return this.service.createVersion(id, body);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }
}
