import { TenantRole } from "@prisma/client";
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: TenantRole[]) => import("@nestjs/common").CustomDecorator<string>;
