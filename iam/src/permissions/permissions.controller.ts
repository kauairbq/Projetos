import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { PermissionsService } from "./permissions.service";

@Controller("permissions")
@UseGuards(AuthGuard("jwt"))
export class PermissionsController {
  constructor(private permissions: PermissionsService) {}

  @Get()
  list() {
    return this.permissions.list();
  }
}
