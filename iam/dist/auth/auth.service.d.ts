import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { LogoutDto } from "./dto/logout.dto";
import { AuditLogsService } from "../audit-logs/audit-logs.service";
export declare class AuthService {
    private prisma;
    private jwt;
    private audit;
    constructor(prisma: PrismaService, jwt: JwtService, audit: AuditLogsService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(dto: RefreshDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(dto: LogoutDto): Promise<{
        ok: boolean;
    }>;
    logoutAll(userId: string): Promise<{
        ok: boolean;
    }>;
}
