import type { RaceResult } from '@acs/shared';
import { EventStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { adaptRaceResult, raceResultInclude } from '../adapters/race-results.adapter.js';

export async function getRaceResultsByRaceId(raceId: string, includePrivate = false): Promise<RaceResult[]> {
  const results = await prisma.raceResult.findMany({
    where: {
      raceId,
      ...(includePrivate
        ? {}
        : {
            race: { isPublicVisible: true, event: { isPublicVisible: true, eventStatus: { not: EventStatus.DRAFT } } }
          })
    },
    include: raceResultInclude,
    orderBy: { place: 'asc' }
  });
  return results.map(adaptRaceResult);
}

export async function getRaceResultsByUserId(userId: string): Promise<RaceResult[]> {
  const results = await prisma.raceResult.findMany({
    where: {
      cyclist: { userId },
      race: { isPublicVisible: true, event: { isPublicVisible: true, eventStatus: { not: EventStatus.DRAFT } } }
    },
    include: raceResultInclude,
    orderBy: { createdAt: 'desc' }
  });
  return results.map(adaptRaceResult);
}

export async function createRaceResult(data: {
  raceId: string;
  cyclistId: string;
  place: number;
  time?: string;
}): Promise<RaceResult> {
  const result = await prisma.raceResult.create({
    data: {
      raceId: data.raceId,
      cyclistId: data.cyclistId,
      place: data.place,
      time: data.time ?? null
    },
    include: raceResultInclude
  });
  return adaptRaceResult(result);
}

export async function updateRaceResult(
  id: string,
  data: Partial<{ place: number; time: string | null }>
): Promise<RaceResult | null> {
  const result = await prisma.raceResult.findUnique({ where: { id } });
  if (!result) return null;
  const updated = await prisma.raceResult.update({
    where: { id },
    data,
    include: raceResultInclude
  });
  return adaptRaceResult(updated);
}

export async function deleteRaceResult(id: string): Promise<boolean> {
  const result = await prisma.raceResult.findUnique({ where: { id } });
  if (!result) return false;
  await prisma.raceResult.delete({ where: { id } });
  return true;
}
