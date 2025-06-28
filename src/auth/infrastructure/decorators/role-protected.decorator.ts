import { SetMetadata } from '@nestjs/common';
import { IValidRoles } from 'src/common/interfaces/valid-roles.interface';

export const META_ROLES = 'roles';

export const RoleProtected = (...args: IValidRoles[]) => {
    return SetMetadata(META_ROLES, args);
}