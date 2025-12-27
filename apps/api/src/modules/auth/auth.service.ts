import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

import { PrismaService } from "../../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hash,
        role: dto.role ?? Role.TRAVELER,
        verified: true, // Email подтверждение можно добавить позже
        profile: {
          create: {
            name: dto.name
          }
        }
      },
      include: {
        profile: true
      }
    });

    const token = await this.signToken(user.id, user.email, user.role);
    return { token, user };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { profile: true }
    });
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const token = await this.signToken(user.id, user.email, user.role);
    return { token, user };
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });
  }

  private async signToken(userId: string, email: string, role: Role) {
    const payload = { sub: userId, email, role };
    return this.jwtService.signAsync(payload, {
      secret: this.config.get("JWT_SECRET"),
      expiresIn: this.config.get("JWT_EXPIRES_IN") ?? "7d"
    });
  }
}
