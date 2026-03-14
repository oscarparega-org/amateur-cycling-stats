import type { RoleTypeEnum } from '../../enums/role-type.enum.js';
import type { UserStatus } from '../../enums/status.enum.js';

export interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleType: RoleTypeEnum.ADMIN;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}
