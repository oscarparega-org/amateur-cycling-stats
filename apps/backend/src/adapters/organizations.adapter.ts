import type { Organization } from '@acs/shared';
import type { Organization as PrismaOrganization } from '@prisma/client';

type PrismaOrgWithCount = PrismaOrganization & {
  _count?: { events: number };
};

export function adaptOrganization(org: PrismaOrgWithCount): Organization {
  return {
    id: org.id,
    name: org.name,
    description: org.description,
    state: org.state,
    eventCount: org._count?.events,
    createdAt: org.createdAt.toISOString(),
    updatedAt: org.updatedAt.toISOString()
  };
}
