import { IValidRoles } from '../../../common/interfaces/valid-roles.interface';
import { SetMetadata } from '@nestjs/common';

export const META_ROLES = 'roles';

export const RoleProtected = (...args: IValidRoles[]) => SetMetadata(META_ROLES, args);