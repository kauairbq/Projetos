import { PrismaService } from "../prisma/prisma.service";
export declare class AuditLogsService {
    private prisma;
    constructor(prisma: PrismaService);
    list(tenantId: string): import(".prisma/client").Prisma.PrismaPromise<{
        tenantId: string;
        id: string;
        actorId: string | null;
        action: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
    }[]>;
    create(tenantId: string, action: string, actorId?: string, metadata?: any): import(".prisma/client").Prisma.Prisma__AuditLogClient<{
        tenantId: string;
        id: string;
        actorId: string | null;
        action: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
