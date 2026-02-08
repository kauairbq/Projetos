import { TenantsService } from "./tenants.service";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { InviteTenantUserDto } from "./dto/invite-tenant-user.dto";
import { AcceptInviteDto } from "./dto/accept-invite.dto";
import { UpdateTenantRoleDto } from "./dto/update-tenant-role.dto";
export declare class TenantsController {
    private readonly tenants;
    constructor(tenants: TenantsService);
    create(dto: CreateTenantDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        slug: string;
    }>;
    invite(id: string, dto: InviteTenantUserDto): Promise<{
        email: string;
        tenantId: string;
        id: string;
        createdAt: Date;
        token: string;
        status: string;
        acceptedAt: Date | null;
    }>;
    acceptInvite(dto: AcceptInviteDto): Promise<{
        ok: boolean;
    }>;
    listUsers(id: string): import(".prisma/client").Prisma.PrismaPromise<({
        user: {
            email: string;
            password: string;
            id: string;
            createdAt: Date;
            name: string | null;
            updatedAt: Date;
        };
    } & {
        role: import(".prisma/client").$Enums.TenantRole;
        tenantId: string;
        id: string;
        userId: string;
    })[]>;
    updateRole(id: string, userId: string, dto: UpdateTenantRoleDto): Promise<{
        role: import(".prisma/client").$Enums.TenantRole;
        tenantId: string;
        id: string;
        userId: string;
    }>;
}
