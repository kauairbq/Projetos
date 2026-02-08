import { PrismaService } from "../prisma/prisma.service";
export declare class RolesService {
    private prisma;
    constructor(prisma: PrismaService);
    list(tenantId: string): import(".prisma/client").Prisma.PrismaPromise<({
        permissions: {
            id: string;
            roleId: string;
            permissionId: string;
        }[];
    } & {
        tenantId: string;
        id: string;
        name: string;
    })[]>;
    create(tenantId: string, name: string): import(".prisma/client").Prisma.Prisma__RoleClient<{
        tenantId: string;
        id: string;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
