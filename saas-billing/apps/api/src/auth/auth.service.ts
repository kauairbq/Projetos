import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
      },
    });
    return this.issueTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException("Credenciais inválidas");
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("Credenciais inválidas");
    return this.issueTokens(user.id, user.email, user.role);
  }

  private async issueTokens(userId: string, email: string, role: string) {
    const accessTtl = this.config.get<string>("JWT_ACCESS_TTL") ?? "15m";
    const refreshTtl = this.config.get<string>("JWT_REFRESH_TTL") ?? "7d";

    const accessToken = await this.jwt.signAsync(
      { sub: userId, email, role },
      { secret: this.config.get<string>("JWT_ACCESS_SECRET"), expiresIn: accessTtl },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, email, role },
      { secret: this.config.get<string>("JWT_REFRESH_SECRET"), expiresIn: refreshTtl },
    );

    const refreshHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = this.resolveExpiry(refreshTtl);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: refreshHash,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private resolveExpiry(ttl: string) {
    const now = new Date();
    if (ttl.endsWith("d")) {
      const days = Number(ttl.replace("d", ""));
      return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    }
    if (ttl.endsWith("h")) {
      const hours = Number(ttl.replace("h", ""));
      return new Date(now.getTime() + hours * 60 * 60 * 1000);
    }
    if (ttl.endsWith("m")) {
      const minutes = Number(ttl.replace("m", ""));
      return new Date(now.getTime() + minutes * 60 * 1000);
    }
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
}
