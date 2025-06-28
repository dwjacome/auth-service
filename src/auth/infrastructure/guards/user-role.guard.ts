import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from '../decorators';

@Injectable()
export class UserRoleGuard implements CanActivate {

    constructor(
        private readonly reflector: Reflector
    ) { }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler())

        if (!validRoles) return true;
        if (validRoles.length === 0) return true;

        const req = context.switchToHttp().getRequest();
        const user = req.user;

        if (!user)
            throw new ForbiddenException('User not found');

        if (user.roles && Array.isArray(user.roles) && user.roles.includes('superadmin')) {
            return true;
        }

        if (!user.roles || !Array.isArray(user.roles)) {
            throw new ForbiddenException('User has no valid roles');
        }

        for (const role of user.roles) {
            if (validRoles.includes(role)) {
                return true;
            }
        }

        throw new ForbiddenException(
            `User ${user.username || 'unknown'} need a valid role: [${validRoles}]`
        );
    }
}