import type { Organizer } from '@acs/shared';
import { RoleTypeEnum } from '@acs/shared';
import type { Organizer as PrismaOrganizer, User, Role } from '@prisma/client';

type PrismaOrganizerWithRelations = PrismaOrganizer & {
  user: User & { role: Role };
};

// Role names in seed data are exact uppercase: 'ORGANIZER_OWNER', 'ORGANIZER_STAFF'
// matching RoleTypeEnum values. Validated here with explicit check.
export function adaptOrganizer(org: PrismaOrganizerWithRelations): Organizer {
  const roleName = org.user.role.name;
  let roleType: RoleTypeEnum.ORGANIZER_OWNER | RoleTypeEnum.ORGANIZER_STAFF;
  if (roleName === RoleTypeEnum.ORGANIZER_OWNER) {
    roleType = RoleTypeEnum.ORGANIZER_OWNER;
  } else if (roleName === RoleTypeEnum.ORGANIZER_STAFF) {
    roleType = RoleTypeEnum.ORGANIZER_STAFF;
  } else {
    throw new Error(`Unexpected organizer role: ${roleName}`);
  }
  return {
    id: org.id,
    firstName: org.user.firstName,
    lastName: org.user.lastName ?? '',
    email: org.user.email ?? '',
    roleType,
    organizationId: org.organizationId,
    status: org.user.status,
    createdAt: org.createdAt.toISOString(),
    updatedAt: org.updatedAt.toISOString()
  };
}

export const organizerInclude = {
  user: { include: { role: true } }
} as const;
