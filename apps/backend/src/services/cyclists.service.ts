import type { Cyclist } from '@acs/shared';
import { prisma } from '../lib/prisma.js';
import { adaptCyclist, cyclistInclude } from '../adapters/cyclists.adapter.js';

export async function getCyclistById(id: string): Promise<Cyclist | null> {
  const cyclist = await prisma.cyclist.findUnique({
    where: { id },
    include: cyclistInclude
  });
  return cyclist ? adaptCyclist(cyclist) : null;
}

export async function createUnregisteredCyclist(data: {
  firstName: string;
  lastName?: string;
  bornYear?: number;
  genderId?: string;
}): Promise<Cyclist> {
  const cyclistRole = await prisma.role.findUnique({ where: { name: 'CYCLIST' } });
  if (!cyclistRole) throw new Error('CYCLIST role not found');

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName ?? null,
        name: `${data.firstName} ${data.lastName ?? ''}`.trim(),
        status: 'UNREGISTERED',
        roleId: cyclistRole.id
      }
    });
    const cyclist = await tx.cyclist.create({
      data: {
        userId: user.id,
        bornYear: data.bornYear ?? null,
        genderId: data.genderId ?? null
      },
      include: cyclistInclude
    });
    return cyclist;
  });
  return adaptCyclist(result);
}

export async function updateCyclist(
  id: string,
  data: Partial<{ bornYear: number | null; genderId: string | null }>
): Promise<Cyclist | null> {
  const cyclist = await prisma.cyclist.findUnique({ where: { id } });
  if (!cyclist) return null;
  const updated = await prisma.cyclist.update({
    where: { id },
    data,
    include: cyclistInclude
  });
  return adaptCyclist(updated);
}

export async function deleteCyclist(id: string): Promise<boolean> {
  const cyclist = await prisma.cyclist.findUnique({ where: { id } });
  if (!cyclist) return false;
  await prisma.cyclist.delete({ where: { id } });
  return true;
}
