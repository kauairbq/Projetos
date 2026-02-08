import { Module } from "@nestjs/common";
import { OrganizationUsersService } from "./organization-users.service";
import { OrganizationUsersController } from "./organization-users.controller";
import { AuditLogsModule } from "../audit-logs/audit-logs.module";

@Module({
  imports: [AuditLogsModule],
  providers: [OrganizationUsersService],
  controllers: [OrganizationUsersController],
})
export class OrganizationUsersModule {}
