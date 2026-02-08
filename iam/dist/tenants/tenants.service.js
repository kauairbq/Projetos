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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_1 = require("crypto");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
let TenantsService = class TenantsService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async create(dto) {
        const tenant = await this.prisma.tenant.create({ data: dto });
        await this.audit.create(tenant.id, "tenant.created", undefined, { slug: tenant.slug });
        return tenant;
    }
    async invite(tenantId, dto) {
        const token = (0, crypto_1.randomUUID)();
        const invite = await this.prisma.tenantInvite.create({
            data: {
                tenantId,
                email: dto.email,
                token,
            },
        });
        await this.audit.create(tenantId, "tenant.invite", undefined, { email: dto.email });
        return invite;
    }
    async acceptInvite(dto) {
        const invite = await this.prisma.tenantInvite.findUnique({ where: { token: dto.token } });
        if (!invite)
            throw new common_1.NotFoundException("Convite invalido");
        const user = await this.prisma.user.findUnique({ where: { email: invite.email } });
        if (!user)
            throw new common_1.NotFoundException("Utilizador nao encontrado");
        await this.prisma.tenantUser.upsert({
            where: { tenantId_userId: { tenantId: invite.tenantId, userId: user.id } },
            update: {},
            create: { tenantId: invite.tenantId, userId: user.id, role: "MEMBER" },
        });
        await this.prisma.tenantInvite.update({
            where: { id: invite.id },
            data: { status: "ACCEPTED", acceptedAt: new Date() },
        });
        await this.audit.create(invite.tenantId, "tenant.invite.accepted", user.id, { email: user.email });
        return { ok: true };
    }
    listUsers(tenantId) {
        return this.prisma.tenantUser.findMany({
            where: { tenantId },
            include: { user: true },
        });
    }
    async updateRole(tenantId, userId, dto) {
        const membership = await this.prisma.tenantUser.findUnique({
            where: { tenantId_userId: { tenantId, userId } },
        });
        if (!membership)
            throw new common_1.NotFoundException("Utilizador nao pertence ao tenant");
        const updated = await this.prisma.tenantUser.update({
            where: { tenantId_userId: { tenantId, userId } },
            data: { role: dto.role },
        });
        await this.audit.create(tenantId, "tenant.role.updated", userId, { role: dto.role });
        return updated;
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_logs_service_1.AuditLogsService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map