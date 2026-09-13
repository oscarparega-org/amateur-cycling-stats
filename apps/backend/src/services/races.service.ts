import type { Race } from '@acs/shared';
import { prisma } from '../lib/prisma.js';
import { adaptRace, raceInclude } from '../adapters/races.adapter.js';

export async function getRacesByEventId(eventId: string, includePrivate = false): Promise<Race[]> {
  const races = await prisma.race.findMany({
    where: {
      eventId,
      ...(includePrivate ? {} : { isPublicVisible: true, event: { isPublicVisible: true } })
    },
    include: raceInclude,
    orderBy: { dateTime: 'asc' }
  });
  return races.map(adaptRace);
}

export async function getRaceById(id: string, includePrivate = false): Promise<Race | null> {
  const race = await prisma.race.findFirst({
    where: {
      id,
      ...(includePrivate ? {} : { isPublicVisible: true, event: { isPublicVisible: true } })
    },
    include: raceInclude
  });
  return race ? adaptRace(race) : null;
}

export async function createRace(data: {
  eventId: string;
  raceCategoryAgeId: string;
  raceCategoryGenderId: string;
  raceCategoryDistanceId: string;
  dateTime: string;
  name?: string;
  description?: string;
}): Promise<Race> {
  const race = await prisma.race.create({
    data: {
      eventId: data.eventId,
      raceCategoryAgeId: data.raceCategoryAgeId,
      raceCategoryGenderId: data.raceCategoryGenderId,
      raceCategoryDistanceId: data.raceCategoryDistanceId,
      dateTime: new Date(data.dateTime),
      name: data.name ?? null,
      description: data.description ?? null
    },
    include: raceInclude
  });
  return adaptRace(race);
}

export async function updateRace(
  id: string,
  data: Partial<{
    name: string | null;
    description: string | null;
    dateTime: string;
    raceCategoryAgeId: string;
    raceCategoryGenderId: string;
    raceCategoryDistanceId: string;
    isPublicVisible: boolean;
  }>
): Promise<Race | null> {
  const race = await prisma.race.findUnique({ where: { id } });
  if (!race) return null;
  const updateData: Record<string, unknown> = { ...data };
  if (data.dateTime) updateData.dateTime = new Date(data.dateTime);
  const updated = await prisma.race.update({
    where: { id },
    data: updateData,
    include: raceInclude
  });
  return adaptRace(updated);
}

export async function deleteRace(id: string): Promise<boolean> {
  const race = await prisma.race.findUnique({ where: { id } });
  if (!race) return false;
  await prisma.race.delete({ where: { id } });
  return true;
}
