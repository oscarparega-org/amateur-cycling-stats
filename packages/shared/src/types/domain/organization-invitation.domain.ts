import type { RoleTypeEnum } from '../../enums/role-type.enum.js';
import type { InvitationStatus } from '../../enums/status.enum.js';

export interface OrganizationInvitation {
  id: string;
  organizationId: string;
  email: string;
  invitedByUserId: string;
  roleType: RoleTypeEnum.ORGANIZER_OWNER | RoleTypeEnum.ORGANIZER_STAFF;
  status: InvitationStatus;
  retryCount: number;
  lastInvitationSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}
