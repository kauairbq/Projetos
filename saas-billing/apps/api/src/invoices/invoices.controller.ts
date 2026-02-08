import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { InvoicesService } from "./invoices.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
import { OrganizationGuard } from "../common/guards/organization.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { OrganizationRole } from "@prisma/client";

@Controller("invoices")
@UseGuards(AuthGuard("jwt"), OrganizationGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(dto);
  }

  @Get()
  @Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  findAll() {
    return this.invoicesService.findAll();
  }

  @Get(":id")
  @Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  findOne(@Param("id") id: string) {
    return this.invoicesService.findOne(id);
  }

  @Patch(":id")
  @Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  update(@Param("id") id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, dto);
  }

  @Delete(":id")
  @Roles(OrganizationRole.OWNER)
  remove(@Param("id") id: string) {
    return this.invoicesService.remove(id);
  }
}
