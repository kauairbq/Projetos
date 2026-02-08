import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { TenantsModule } from "./tenants/tenants.module";
import { RolesModule } from "./roles/roles.module";
import { PermissionsModule } from "./permissions/permissions.module";
import { AuditLogsModule } from "./audit-logs/audit-logs.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TenantsModule,
    RolesModule,
    PermissionsModule,
    AuditLogsModule,
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60, limit: 100 }],
    }),
  ],
})
export class AppModule {}
