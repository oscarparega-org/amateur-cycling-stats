import type { OrganizationInvitation } from '@acs/shared';
import { RoleTypeEnum } from '@acs/shared';
import type { OrganizationInvitation as PrismaInvitation } from '@prisma/client';

export function adaptInvitation(inv: PrismaInvitation): OrganizationInvitation {
  return {
    id: inv.id,
    organizationId: inv.organizationId,
    email: inv.email,
    invitedByUserId: inv.invitedByUserId,
    roleType: RoleTypeEnum.ORGANIZER,
    status: inv.status,
    retryCount: inv.retryCount,
    lastInvitationSentAt: inv.lastInvitationSentAt?.toISOString() ?? null,
    createdAt: inv.createdAt.toISOString(),
    updatedAt: inv.updatedAt.toISOString()
  };
}
