import type { Organizer, PartialOrganizer } from '@acs/shared';
import { PG_ERROR_CODES } from '@acs/shared';
import { prisma } from '../lib/prisma.js';
import { adaptOrganizer, organizerInclude } from '../adapters/organizers.adapter.js';

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

export async function updateOrganizer(id: string, data: PartialOrganizer): Promise<Organizer | null> {
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

  const organizerCount = await prisma.organizer.count({
    where: { organizationId: organizer.organizationId }
  });
  if (organizerCount <= 1) {
    return { success: false, errorCode: PG_ERROR_CODES.CANNOT_DELETE_LAST_ORGANIZER };
  }

  await prisma.organizer.delete({ where: { id } });
  return { success: true };
}
