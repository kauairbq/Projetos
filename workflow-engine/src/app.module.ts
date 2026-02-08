import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { BullModule } from "@nestjs/bull";
import { PrismaModule } from "./prisma/prisma.module";
import { WorkflowsModule } from "./workflows/workflows.module";
import { VersionsModule } from "./versions/versions.module";
import { InstancesModule } from "./instances/instances.module";
import { RulesModule } from "./rules/rules.module";
import { AuditModule } from "./audit/audit.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60, limit: 100 }] }),
    BullModule.forRoot({
      redis: process.env.REDIS_URL ?? "redis://localhost:6379",
    }),
    PrismaModule,
    WorkflowsModule,
    VersionsModule,
    InstancesModule,
    RulesModule,
    AuditModule,
  ],
})
export class AppModule {}
