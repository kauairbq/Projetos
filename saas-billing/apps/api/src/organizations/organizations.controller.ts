import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { OrganizationsService } from "./organizations.service";
import { CreateOrganizationDto, UpdateOrganizationDto } from "./dto/organization.dto";
import { OrganizationGuard } from "../common/guards/organization.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { OrganizationRole } from "@prisma/client";

@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly service: OrganizationsService) {}

  @Post()
  @UseGuards(AuthGuard("jwt"))
  create(@Body() dto: CreateOrganizationDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(AuthGuard("jwt"), OrganizationGuard, RolesGuard)
  @Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  findAll() {
    return this.service.findAll();
  }

  @Get(":id")
  @UseGuards(AuthGuard("jwt"), OrganizationGuard, RolesGuard)
  @Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Patch(":id")
  @UseGuards(AuthGuard("jwt"), OrganizationGuard, RolesGuard)
  @Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  update(@Param("id") id: string, @Body() dto: UpdateOrganizationDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard("jwt"), OrganizationGuard, RolesGuard)
  @Roles(OrganizationRole.OWNER)
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
