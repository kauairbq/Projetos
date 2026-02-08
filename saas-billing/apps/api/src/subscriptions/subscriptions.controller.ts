import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { SubscriptionsService } from "./subscriptions.service";
import { CreateSubscriptionDto } from "./dto/create-subscription.dto";
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto";
import { OrganizationGuard } from "../common/guards/organization.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { OrganizationRole } from "@prisma/client";

@Controller("subscriptions")
@UseGuards(AuthGuard("jwt"), OrganizationGuard, RolesGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  create(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(dto);
  }

  @Get()
  @Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get(":id")
  @Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  findOne(@Param("id") id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Patch(":id")
  @Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  update(@Param("id") id: string, @Body() dto: UpdateSubscriptionDto) {
    return this.subscriptionsService.update(id, dto);
  }

  @Delete(":id")
  @Roles(OrganizationRole.OWNER)
  remove(@Param("id") id: string) {
    return this.subscriptionsService.remove(id);
  }
}
