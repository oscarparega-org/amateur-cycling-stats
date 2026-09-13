import type { Organizer } from '@acs/shared';
import { RoleTypeEnum } from '@acs/shared';
import type { Organizer as PrismaOrganizer, User, Role } from '@prisma/client';

type PrismaOrganizerWithRelations = PrismaOrganizer & {
  user: User & { role: Role | null };
};

export function adaptOrganizer(org: PrismaOrganizerWithRelations): Organizer {
  const roleName = org.user.role?.name;
  if (roleName !== RoleTypeEnum.ORGANIZER) {
    throw new Error(`Unexpected organizer role: ${roleName}`);
  }
  return {
    id: org.id,
    firstName: org.user.firstName ?? '',
    lastName: org.user.lastName ?? '',
    email: org.user.email ?? '',
    roleType: RoleTypeEnum.ORGANIZER,
    organizationId: org.organizationId,
    status: org.user.status,
    createdAt: org.createdAt.toISOString(),
    updatedAt: org.updatedAt.toISOString()
  };
}

export const organizerInclude = {
  user: { include: { role: true } }
} as const;
