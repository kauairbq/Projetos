import { Controller, Get, UseGuards, Req } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { TenantGuard } from "../common/guards/tenant.guard";
import { AuditLogsService } from "./audit-logs.service";

@Controller("audit-logs")
@UseGuards(AuthGuard("jwt"), TenantGuard)
export class AuditLogsController {
  constructor(private logs: AuditLogsService) {}

  @Get()
  list(@Req() req: any) {
    return this.logs.list(req.tenantId);
  }
}
