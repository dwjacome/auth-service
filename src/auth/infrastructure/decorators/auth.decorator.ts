import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserRoleGuard } from '../../infrastructure/guards/user-role.guard';

import { RoleProtected } from './role-protected.decorator';
import { IValidRoles } from 'src/common/interfaces/valid-roles.interface';

export function Auth(...roles: IValidRoles[]) {
    return applyDecorators(
        RoleProtected(...roles),
        UseGuards(AuthGuard(), UserRoleGuard),
    );
}