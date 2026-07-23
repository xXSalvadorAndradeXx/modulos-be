// src/modules/auth/auth.service.ts
import {
  Injectable, UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto, meta: { userAgent?: string; ip?: string }) {
    // 1. Buscar usuario por email
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    // 2. Verificar si está bloqueado
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException(
        `Cuenta bloqueada hasta ${user.lockedUntil.toISOString()}`,
      );
    }

    // 3. Verificar contraseña
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 4. Verificar que esté activo
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // 5. Resetear intentos fallidos
    await this.resetFailedAttempts(user);

    // 6. Generar tokens
    return this.generateTokenPair(user, meta);
  }

  async refresh(dto: RefreshTokenDto, userId: string) {
    const tokenHash = this.hashToken(dto.refreshToken);

    const stored = await this.refreshTokenRepo.findOne({
      where: { userId, tokenHash, isRevoked: false },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    // Rotación: revocar el token usado y emitir uno nuevo
    await this.refreshTokenRepo.update(stored.id, { isRevoked: true });

    const user = await this.usersService.findOne(userId);
    return this.generateTokenPair(user, {});
  }

  async logout(userId: string): Promise<void> {
    // Revocar todos los refresh tokens del usuario
    await this.refreshTokenRepo.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersService.findOne(userId);

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new ForbiddenException('Contraseña actual incorrecta');

    const newHash = await bcrypt.hash(dto.newPassword, 12);

    await this.usersService['userRepo'].update(userId, {
      passwordHash:       newHash,
      mustChangePassword: false,
      failedLoginAttempts: 0,
    });

    // Revocar todos los refresh tokens (sesiones previas)
    await this.logout(userId);
  }

  // ── Helpers privados ────────────────────────────────────────────────────

  private async generateTokenPair(
    user: User,
    meta: { userAgent?: string; ip?: string },
  ) {
    const payload = {
      sub:         user.id,
      email:       user.email,
      roles:       user.roles.map((r) => r.name),
      permissions: user.effectivePermissions,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret:    this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });

    const refreshToken = crypto.randomBytes(64).toString('hex');
    const tokenHash    = this.hashToken(refreshToken);
    const expiresIn    = this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d';
    const expiresAt    = this.parseExpiry(expiresIn);

    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({
        userId:    user.id,
        tokenHash,
        expiresAt,
        userAgent: meta.userAgent ?? null,
        ipAddress: meta.ip ?? null,
      }),
    );

    return {
      accessToken,
      refreshToken,
      expiresIn:        this.configService.get<string>('jwt.expiresIn'),
      mustChangePassword: user.mustChangePassword,
      user: {
        id:          user.id,
        firstName:   user.firstName,
        lastName:    user.lastName,
        email:       user.email,
        roles:       user.roles.map((r) => r.name),
        permissions: user.effectivePermissions,
      },
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseExpiry(expiry: string): Date {
    const unit  = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1), 10);
    const ms    = unit === 'd' ? value * 86400000
                : unit === 'h' ? value * 3600000
                : unit === 'm' ? value * 60000
                : value * 1000;
    return new Date(Date.now() + ms);
  }

  private async handleFailedLogin(user: User): Promise<void> {
    const attempts = user.failedLoginAttempts + 1;
    const update: Partial<User> = { failedLoginAttempts: attempts };

    // Bloquear 15 minutos después de 5 intentos fallidos
    if (attempts >= 5) {
      update.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    await this.usersService['userRepo'].update(user.id, update);
  }

  private async resetFailedAttempts(user: User): Promise<void> {
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await this.usersService['userRepo'].update(user.id, {
        failedLoginAttempts: 0,
        lockedUntil:         null,
      });
    }
  }
}