import type { RoleTypeEnum } from '../../enums/role-type.enum.js';
import type { UserStatus } from '../../enums/status.enum.js';

export interface Organizer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleType: RoleTypeEnum.ORGANIZER_OWNER | RoleTypeEnum.ORGANIZER_STAFF;
  organizationId: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export type PartialOrganizer = Partial<Pick<Organizer, 'firstName' | 'lastName' | 'roleType'>>;
