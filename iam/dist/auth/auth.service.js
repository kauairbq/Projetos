"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const argon2_1 = require("@node-rs/argon2");
const crypto_1 = require("crypto");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
let AuthService = class AuthService {
    constructor(prisma, jwt, audit) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.audit = audit;
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user)
            throw new common_1.UnauthorizedException("Credenciais invalidas");
        const ok = await (0, argon2_1.verify)(user.password, dto.password);
        if (!ok)
            throw new common_1.UnauthorizedException("Credenciais invalidas");
        const tenantId = dto.tenantId;
        if (!tenantId)
            throw new common_1.ForbiddenException("tenantId obrigatorio");
        const membership = await this.prisma.tenantUser.findUnique({
            where: { tenantId_userId: { tenantId, userId: user.id } },
        });
        if (!membership)
            throw new common_1.ForbiddenException("Sem acesso ao tenant");
        const sessionId = (0, crypto_1.randomUUID)();
        const refreshToken = await this.jwt.signAsync({ sub: user.id, tenantId, sessionId, role: membership.role }, { expiresIn: "30d" });
        const refreshHash = await (0, argon2_1.hash)(refreshToken);
        await this.prisma.session.create({
            data: {
                id: sessionId,
                userId: user.id,
                tenantId,
                refreshTokenHash: refreshHash,
            },
        });
        const accessToken = await this.jwt.signAsync({ sub: user.id, tenantId, role: membership.role }, { expiresIn: "15m" });
        await this.audit.create(tenantId, "login", user.id, { sessionId });
        return { accessToken, refreshToken };
    }
    async refresh(dto) {
        const payload = this.jwt.decode(dto.refreshToken);
        if (!payload?.sessionId)
            throw new common_1.UnauthorizedException("Refresh invalido");
        const session = await this.prisma.session.findUnique({ where: { id: payload.sessionId } });
        if (!session || session.revokedAt)
            throw new common_1.UnauthorizedException("Sessao expirada");
        const valid = await (0, argon2_1.verify)(session.refreshTokenHash, dto.refreshToken);
        if (!valid)
            throw new common_1.UnauthorizedException("Refresh invalido");
        const membership = await this.prisma.tenantUser.findUnique({
            where: { tenantId_userId: { tenantId: session.tenantId, userId: session.userId } },
        });
        if (!membership)
            throw new common_1.ForbiddenException("Sem acesso ao tenant");
        const newRefresh = await this.jwt.signAsync({ sub: session.userId, tenantId: session.tenantId, sessionId: session.id, role: membership.role }, { expiresIn: "30d" });
        await this.prisma.session.update({
            where: { id: session.id },
            data: { refreshTokenHash: await (0, argon2_1.hash)(newRefresh) },
        });
        const accessToken = await this.jwt.signAsync({ sub: session.userId, tenantId: session.tenantId, role: membership.role }, { expiresIn: "15m" });
        await this.audit.create(session.tenantId, "refresh", session.userId, { sessionId: session.id });
        return { accessToken, refreshToken: newRefresh };
    }
    async logout(dto) {
        const payload = this.jwt.decode(dto.refreshToken);
        if (!payload?.sessionId)
            return { ok: true };
        await this.prisma.session.update({
            where: { id: payload.sessionId },
            data: { revokedAt: new Date() },
        });
        if (payload.tenantId && payload.sub) {
            await this.audit.create(payload.tenantId, "logout", payload.sub, { sessionId: payload.sessionId });
        }
        return { ok: true };
    }
    async logoutAll(userId) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        audit_logs_service_1.AuditLogsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map