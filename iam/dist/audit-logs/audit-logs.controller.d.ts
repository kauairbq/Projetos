import { AuditLogsService } from "./audit-logs.service";
export declare class AuditLogsController {
    private logs;
    constructor(logs: AuditLogsService);
    list(req: any): import(".prisma/client").Prisma.PrismaPromise<{
        tenantId: string;
        id: string;
        actorId: string | null;
        action: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
    }[]>;
}
