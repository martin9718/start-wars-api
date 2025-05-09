import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../../../users/domain/entities/user';
import { ForbiddenError } from '../../domain/errors/forbidden-error';

interface RequestWithUser extends Request {
  user: User;
}

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const user = request.user;

    if (!user) {
      throw new ForbiddenError('User not authenticated');
    }

    const hasRequiredRole = requiredRoles.some((role) => user.hasRole(role));
    if (!hasRequiredRole) {
      throw new ForbiddenError(`User does not have required permissions`);
    }

    return true;
  }
}
