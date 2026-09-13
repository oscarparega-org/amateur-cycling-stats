import type { OrganizationInvitation } from '@acs/shared';
import type { InvitationStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { adaptInvitation } from '../adapters/invitations.adapter.js';

export async function getInvitationsByOrganizationId(organizationId: string): Promise<OrganizationInvitation[]> {
  const invitations = await prisma.organizationInvitation.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' }
  });
  return invitations.map(adaptInvitation);
}

export async function getInvitationByEmail(email: string): Promise<OrganizationInvitation | null> {
  const invitation = await prisma.organizationInvitation.findFirst({
    where: { email, status: 'PENDING' }
  });
  return invitation ? adaptInvitation(invitation) : null;
}

export async function createInvitation(data: {
  organizationId: string;
  email: string;
  invitedByUserId: string;
}): Promise<OrganizationInvitation> {
  const invitation = await prisma.organizationInvitation.create({
    data: {
      organizationId: data.organizationId,
      email: data.email,
      invitedByUserId: data.invitedByUserId,
      roleType: 'ORGANIZER'
    }
  });
  return adaptInvitation(invitation);
}

export async function updateInvitation(
  id: string,
  data: { status?: 'PENDING' | 'ACCEPTED' | 'EXPIRED'; retryCount?: number }
): Promise<OrganizationInvitation | null> {
  const invitation = await prisma.organizationInvitation.findUnique({ where: { id } });
  if (!invitation) return null;
  const updateData: Record<string, unknown> = {};
  if (data.status) updateData.status = data.status as InvitationStatus;
  if (data.retryCount !== undefined) {
    updateData.retryCount = data.retryCount;
    // Only update lastInvitationSentAt when actually resending (retryCount changes)
    updateData.lastInvitationSentAt = new Date();
  }
  const updated = await prisma.organizationInvitation.update({
    where: { id },
    data: updateData
  });
  return adaptInvitation(updated);
}

export async function deleteInvitation(id: string): Promise<boolean> {
  const invitation = await prisma.organizationInvitation.findUnique({ where: { id } });
  if (!invitation) return false;
  await prisma.organizationInvitation.delete({ where: { id } });
  return true;
}
