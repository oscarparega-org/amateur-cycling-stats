import type { Organizer, PartialOrganizer } from '@acs/shared';
import { PG_ERROR_CODES, RoleTypeEnum } from '@acs/shared';
import { prisma } from '../lib/prisma.js';
import { adaptOrganizer, organizerInclude } from '../adapters/organizers.adapter.js';

// Uses RoleTypeEnum for all role name comparisons to avoid string literal fragility

export async function getOrganizersByOrganizationId(organizationId: string): Promise<Organizer[]> {
  const organizers = await prisma.organizer.findMany({
    where: { organizationId },
    include: organizerInclude
  });
  return organizers.map(adaptOrganizer);
}

export async function getOrganizersCountByOrganizationId(organizationId: string): Promise<number> {
  return prisma.organizer.count({ where: { organizationId } });
}

export async function updateOrganizer(
  id: string,
  data: PartialOrganizer
): Promise<Organizer | null> {
  const organizer = await prisma.organizer.findUnique({
    where: { id },
    include: organizerInclude
  });
  if (!organizer) return null;

  await prisma.$transaction(async (tx) => {
    // Update user fields (firstName, lastName)
    const userUpdate: Record<string, unknown> = {};
    if (data.firstName !== undefined) userUpdate.firstName = data.firstName;
    if (data.lastName !== undefined) userUpdate.lastName = data.lastName;

    if (Object.keys(userUpdate).length > 0) {
      await tx.user.update({ where: { id: organizer.userId }, data: userUpdate });
    }

    // Update role if roleType changed
    if (data.roleType !== undefined) {
      const roleName = data.roleType === RoleTypeEnum.ORGANIZER_OWNER
        ? 'ORGANIZER_OWNER'
        : 'ORGANIZER_STAFF';
      const role = await tx.role.findUnique({ where: { name: roleName } });
      if (role) {
        await tx.user.update({
          where: { id: organizer.userId },
          data: { roleId: role.id }
        });
      }
    }
  });

  const updated = await prisma.organizer.findUnique({
    where: { id },
    include: organizerInclude
  });
  return updated ? adaptOrganizer(updated) : null;
}

export async function deleteOrganizer(id: string): Promise<{ success: boolean; errorCode?: string }> {
  const organizer = await prisma.organizer.findUnique({
    where: { id },
    include: { user: { include: { role: true } } }
  });
  if (!organizer) return { success: false, errorCode: 'NOT_FOUND' };

  // Check if this is the last owner — use RoleTypeEnum for safe comparison
  if (organizer.user.role?.name === RoleTypeEnum.ORGANIZER_OWNER) {
    const ownerRole = await prisma.role.findUnique({ where: { name: RoleTypeEnum.ORGANIZER_OWNER } });
    if (ownerRole) {
      const ownerCount = await prisma.organizer.count({
        where: {
          organizationId: organizer.organizationId,
          user: { roleId: ownerRole.id }
        }
      });
      if (ownerCount <= 1) {
        return { success: false, errorCode: PG_ERROR_CODES.CANNOT_DELETE_LAST_OWNER };
      }
    }
  }

  await prisma.organizer.delete({ where: { id } });
  return { success: true };
}
