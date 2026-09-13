import type { Organization, PartialOrganization } from '@acs/shared';
import { prisma } from '../lib/prisma.js';
import { adaptOrganization } from '../adapters/organizations.adapter.js';

export async function getAllOrganizations(): Promise<Organization[]> {
  const orgs = await prisma.organization.findMany({
    include: { _count: { select: { events: true } } },
    orderBy: { name: 'asc' }
  });
  return orgs.map(adaptOrganization);
}

export async function getOrganizationById(id: string): Promise<Organization | null> {
  const org = await prisma.organization.findUnique({
    where: { id },
    include: { _count: { select: { events: true } } }
  });
  return org ? adaptOrganization(org) : null;
}

export async function createOrganization(data: { name: string; description?: string }): Promise<Organization> {
  const org = await prisma.organization.create({
    data,
    include: { _count: { select: { events: true } } }
  });
  return adaptOrganization(org);
}

export async function updateOrganization(id: string, data: PartialOrganization): Promise<Organization | null> {
  const org = await prisma.organization.findUnique({ where: { id } });
  if (!org) return null;
  const updated = await prisma.organization.update({
    where: { id },
    data,
    include: { _count: { select: { events: true } } }
  });
  return adaptOrganization(updated);
}

export async function deleteOrganization(id: string): Promise<boolean> {
  const org = await prisma.organization.findUnique({ where: { id } });
  if (!org) return false;
  await prisma.organization.delete({ where: { id } });
  return true;
}
