import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

/**
 * Guard de autorización por permisos atómicos.
 * TDD § 2.5 y § 9.2 — Verifica que el usuario tenga TODOS los permisos
 * declarados con @Permissions() en el handler o controller.
 *
 * El conjunto efectivo de permisos del usuario es la UNIÓN de los permisos
 * de todos sus roles (poblado por JwtStrategy en request.user.permissions).
 *
 * Principio: "denegar por defecto" — si no hay @Permissions() declarado
 * explícitamente, el guard deja pasar (la decisión es del JwtAuthGuard).
 * Un endpoint protegido SIN @Permissions() es un defecto de seguridad.
 *
 * Uso: @UseGuards(JwtAuthGuard, PermissionsGuard) + @Permissions('products:create')
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Sin @Permissions() declarado — el guard no bloquea
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const userPermissions: string[] = Array.isArray(user.permissions)
      ? user.permissions
      : [];

    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      const missing = requiredPermissions.filter(
        (p) => !userPermissions.includes(p),
      );
      throw new ForbiddenException(
        `Permiso insuficiente. Permisos faltantes: ${missing.join(', ')}`,
      );
    }

    return true;
  }
}