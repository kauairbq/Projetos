import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto, UpdatePaymentDto } from "./dto/payment.dto";
import { OrganizationId } from "../common/decorators/organization-id.decorator";
import { OrganizationGuard } from "../common/guards/organization.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { OrganizationRole } from "@prisma/client";

@Controller("payments")
@UseGuards(AuthGuard("jwt"), OrganizationGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  create(@Body() dto: CreatePaymentDto, @OrganizationId() organizationId: string) {
    return this.paymentsService.create(dto, organizationId);
  }

  @Get()
  @Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  list(@OrganizationId() organizationId: string) {
    return this.paymentsService.list(organizationId);
  }

  @Patch(":id")
  @Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  update(
    @Param("id") id: string,
    @Body() dto: UpdatePaymentDto,
    @OrganizationId() organizationId: string,
  ) {
    return this.paymentsService.update(id, dto, organizationId);
  }
}
