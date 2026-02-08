import { RolesService } from "./roles.service";
import { CreateRoleDto } from "./dto/create-role.dto";
export declare class RolesController {
    private roles;
    constructor(roles: RolesService);
    list(req: any): import(".prisma/client").Prisma.PrismaPromise<({
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
    create(req: any, dto: CreateRoleDto): import(".prisma/client").Prisma.Prisma__RoleClient<{
        tenantId: string;
        id: string;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
