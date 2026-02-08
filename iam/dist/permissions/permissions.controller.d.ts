import { PermissionsService } from "./permissions.service";
export declare class PermissionsController {
    private permissions;
    constructor(permissions: PermissionsService);
    list(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        key: string;
    }[]>;
}
