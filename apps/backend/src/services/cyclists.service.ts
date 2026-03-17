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
