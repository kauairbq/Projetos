import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { loadKey } from "../common/utils/keys";
import { AuditLogsModule } from "../audit-logs/audit-logs.module";

@Module({
  imports: [
    PrismaModule,
    AuditLogsModule,
    JwtModule.register({
      privateKey: loadKey(process.env.JWT_ACCESS_PRIVATE_KEY_PATH),
      publicKey: loadKey(process.env.JWT_ACCESS_PUBLIC_KEY_PATH),
      signOptions: { algorithm: "RS256" },
      verifyOptions: { algorithms: ["RS256"] },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
