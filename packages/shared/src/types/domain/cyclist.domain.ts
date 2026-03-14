import type { RoleTypeEnum } from '../../enums/role-type.enum.js';
import type { UserStatus } from '../../enums/status.enum.js';

export interface Cyclist {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  roleType: RoleTypeEnum.CYCLIST | null;
  status: UserStatus;
  genderName: string | null;
  bornYear: number | null;
  createdAt: string;
  updatedAt: string;
}
