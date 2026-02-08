import { Injectable, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { LogoutDto } from "./dto/logout.dto";
import { hash, verify } from "@node-rs/argon2";
import { randomUUID } from "crypto";
import { AuditLogsService } from "../audit-logs/audit-logs.service";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private audit: AuditLogsService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException("Credenciais invalidas");

    const ok = await verify(user.password, dto.password);
    if (!ok) throw new UnauthorizedException("Credenciais invalidas");

    const tenantId = dto.tenantId;
    if (!tenantId) throw new ForbiddenException("tenantId obrigatorio");

    const membership = await this.prisma.tenantUser.findUnique({
      where: { tenantId_userId: { tenantId, userId: user.id } },
    });

    if (!membership) throw new ForbiddenException("Sem acesso ao tenant");

    const sessionId = randomUUID();
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, tenantId, sessionId, role: membership.role },
      { expiresIn: "30d" }
    );

    const refreshHash = await hash(refreshToken);

    await this.prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        tenantId,
        refreshTokenHash: refreshHash,
      },
    });

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, tenantId, role: membership.role },
      { expiresIn: "15m" }
    );

    await this.audit.create(tenantId, "login", user.id, { sessionId });

    return { accessToken, refreshToken };
  }

  async refresh(dto: RefreshDto) {
    const payload = this.jwt.decode(dto.refreshToken) as { sub: string; tenantId: string; sessionId: string } | null;
    if (!payload?.sessionId) throw new UnauthorizedException("Refresh invalido");

    const session = await this.prisma.session.findUnique({ where: { id: payload.sessionId } });
    if (!session || session.revokedAt) throw new UnauthorizedException("Sessao expirada");

    const valid = await verify(session.refreshTokenHash, dto.refreshToken);
    if (!valid) throw new UnauthorizedException("Refresh invalido");

    const membership = await this.prisma.tenantUser.findUnique({
      where: { tenantId_userId: { tenantId: session.tenantId, userId: session.userId } },
    });

    if (!membership) throw new ForbiddenException("Sem acesso ao tenant");

    const newRefresh = await this.jwt.signAsync(
      { sub: session.userId, tenantId: session.tenantId, sessionId: session.id, role: membership.role },
      { expiresIn: "30d" }
    );

    await this.prisma.session.update({
      where: { id: session.id },
      data: { refreshTokenHash: await hash(newRefresh) },
    });

    const accessToken = await this.jwt.signAsync(
      { sub: session.userId, tenantId: session.tenantId, role: membership.role },
      { expiresIn: "15m" }
    );

    await this.audit.create(session.tenantId, "refresh", session.userId, { sessionId: session.id });

    return { accessToken, refreshToken: newRefresh };
  }

  async logout(dto: LogoutDto) {
    const payload = this.jwt.decode(dto.refreshToken) as { sessionId: string; tenantId?: string; sub?: string } | null;
    if (!payload?.sessionId) return { ok: true };

    await this.prisma.session.update({
      where: { id: payload.sessionId },
      data: { revokedAt: new Date() },
    });

    if (payload.tenantId && payload.sub) {
      await this.audit.create(payload.tenantId, "logout", payload.sub, { sessionId: payload.sessionId });
    }

    return { ok: true };
  }

  async logoutAll(userId: string) {
    const sessions = await this.prisma.session.findMany({ where: { userId, revokedAt: null } });
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    for (const session of sessions) {
      await this.audit.create(session.tenantId, "logout-all", userId, { sessionId: session.id });
    }

    return { ok: true };
  }
}
