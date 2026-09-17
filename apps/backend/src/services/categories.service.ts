import {
  Prisma,
  type RaceCategory as PrismaAgeCategory,
  type RaceCategoryGender as PrismaGenderCategory,
  type RaceCategoryLength as PrismaDistanceCategory
} from '@prisma/client';
import type { AvailableCategories, RaceCategoryAge, RaceCategoryDistance, RaceCategoryGender } from '@acs/shared';
import { PG_ERROR_CODES } from '@acs/shared';
import { prisma } from '../lib/prisma.js';
import { adaptAgeCategory, adaptDistanceCategory, adaptGenderCategory } from '../adapters/categories.adapter.js';

export type CategoryOwner =
  { scope: 'GLOBAL' } | { scope: 'ORGANIZATION'; organizationId: string } | { scope: 'EVENT'; eventId: string };

export class CategoryConflictError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = 'CategoryConflictError';
  }
}

export class CategoryInputError extends Error {
  constructor(
    readonly field: string,
    message: string
  ) {
    super(message);
    this.name = 'CategoryInputError';
  }
}

function ownerWhere(owner: CategoryOwner) {
  if (owner.scope === 'ORGANIZATION') return { organizationId: owner.organizationId, eventId: null };
  if (owner.scope === 'EVENT') return { organizationId: null, eventId: owner.eventId };
  return { organizationId: null, eventId: null };
}

function ownerData(owner: CategoryOwner) {
  const where = ownerWhere(owner);
  return { organizationId: where.organizationId ?? null, eventId: where.eventId ?? null };
}

function isUniqueError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

async function translateUnique<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (isUniqueError(error)) throw new CategoryConflictError(PG_ERROR_CODES.DUPLICATE_CATEGORY_NAME);
    throw error;
  }
}

export async function getAgeCategories(owner: CategoryOwner): Promise<RaceCategoryAge[]> {
  return (await prisma.raceCategory.findMany({ where: ownerWhere(owner), orderBy: { name: 'asc' } })).map(
    adaptAgeCategory
  );
}

export async function getGenderCategories(owner: CategoryOwner): Promise<RaceCategoryGender[]> {
  return (await prisma.raceCategoryGender.findMany({ where: ownerWhere(owner), orderBy: { name: 'asc' } })).map(
    adaptGenderCategory
  );
}

export async function getDistanceCategories(owner: CategoryOwner): Promise<RaceCategoryDistance[]> {
  return (await prisma.raceCategoryLength.findMany({ where: ownerWhere(owner), orderBy: { name: 'asc' } })).map(
    adaptDistanceCategory
  );
}

export async function getAvailableCategories(eventId: string): Promise<AvailableCategories | null> {
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { organizationId: true } });
  if (!event) return null;
  const globalOwner = { scope: 'GLOBAL' } as const;
  const eventOwner = { scope: 'EVENT', eventId } as const;
  const organizationOwner = event.organizationId
    ? ({ scope: 'ORGANIZATION', organizationId: event.organizationId } as const)
    : null;
  const [
    globalAge,
    organizationAge,
    eventAge,
    globalGender,
    organizationGender,
    eventGender,
    globalDistance,
    organizationDistance,
    eventDistance
  ] = await Promise.all([
    getAgeCategories(globalOwner),
    organizationOwner ? getAgeCategories(organizationOwner) : Promise.resolve([]),
    getAgeCategories(eventOwner),
    getGenderCategories(globalOwner),
    organizationOwner ? getGenderCategories(organizationOwner) : Promise.resolve([]),
    getGenderCategories(eventOwner),
    getDistanceCategories(globalOwner),
    organizationOwner ? getDistanceCategories(organizationOwner) : Promise.resolve([]),
    getDistanceCategories(eventOwner)
  ]);
  return {
    age: { global: globalAge, organization: organizationAge, event: eventAge },
    gender: { global: globalGender, organization: organizationGender, event: eventGender },
    distance: { global: globalDistance, organization: organizationDistance, event: eventDistance }
  };
}

export async function getAgeCategory(id: string, owner: CategoryOwner) {
  const category = await prisma.raceCategory.findFirst({ where: { id, ...ownerWhere(owner) } });
  return category ? adaptAgeCategory(category) : null;
}

export async function getGenderCategory(id: string, owner: CategoryOwner) {
  const category = await prisma.raceCategoryGender.findFirst({ where: { id, ...ownerWhere(owner) } });
  return category ? adaptGenderCategory(category) : null;
}

export async function getDistanceCategory(id: string, owner: CategoryOwner) {
  const category = await prisma.raceCategoryLength.findFirst({ where: { id, ...ownerWhere(owner) } });
  return category ? adaptDistanceCategory(category) : null;
}

export async function createAgeCategory(
  owner: CategoryOwner,
  data: { name: string; fromAge?: number; toAge?: number }
): Promise<RaceCategoryAge> {
  const category = await translateUnique(() =>
    prisma.raceCategory.create({
      data: { ...ownerData(owner), name: data.name, fromAge: data.fromAge ?? null, toAge: data.toAge ?? null }
    })
  );
  return adaptAgeCategory(category);
}

export async function createGenderCategory(owner: CategoryOwner, data: { name: string }) {
  return adaptGenderCategory(
    await translateUnique(() => prisma.raceCategoryGender.create({ data: { ...ownerData(owner), name: data.name } }))
  );
}

export async function createDistanceCategory(owner: CategoryOwner, data: { name: string; distance?: number }) {
  return adaptDistanceCategory(
    await translateUnique(() =>
      prisma.raceCategoryLength.create({
        data: { ...ownerData(owner), name: data.name, distance: data.distance ?? null }
      })
    )
  );
}

function assertMutable(category: { isDefault: boolean }) {
  if (category.isDefault) throw new CategoryConflictError(PG_ERROR_CODES.PROTECTED_CATEGORY);
}

export async function updateAgeCategory(
  id: string,
  owner: CategoryOwner,
  data: { name?: string; fromAge?: number | null; toAge?: number | null }
) {
  const current = await prisma.raceCategory.findFirst({ where: { id, ...ownerWhere(owner) } });
  if (!current) return null;
  assertMutable(current);
  const fromAge = data.fromAge === undefined ? current.fromAge : data.fromAge;
  const toAge = data.toAge === undefined ? current.toAge : data.toAge;
  if (fromAge !== null && toAge !== null && fromAge > toAge) {
    throw new CategoryInputError('toAge', 'Must be greater than or equal to fromAge');
  }
  return adaptAgeCategory(await translateUnique(() => prisma.raceCategory.update({ where: { id }, data })));
}

export async function updateGenderCategory(id: string, owner: CategoryOwner, data: { name?: string }) {
  const current = await prisma.raceCategoryGender.findFirst({ where: { id, ...ownerWhere(owner) } });
  if (!current) return null;
  assertMutable(current);
  return adaptGenderCategory(await translateUnique(() => prisma.raceCategoryGender.update({ where: { id }, data })));
}

export async function updateDistanceCategory(
  id: string,
  owner: CategoryOwner,
  data: { name?: string; distance?: number | null }
) {
  const current = await prisma.raceCategoryLength.findFirst({ where: { id, ...ownerWhere(owner) } });
  if (!current) return null;
  assertMutable(current);
  return adaptDistanceCategory(await translateUnique(() => prisma.raceCategoryLength.update({ where: { id }, data })));
}

type DeletableCategory = (PrismaAgeCategory | PrismaGenderCategory | PrismaDistanceCategory) & {
  _count: { races: number };
};

async function deleteChecked(category: DeletableCategory | null, remove: () => Promise<unknown>) {
  if (!category) return { success: false, errorCode: 'NOT_FOUND' };
  if (category.isDefault) return { success: false, errorCode: PG_ERROR_CODES.PROTECTED_CATEGORY };
  if (category._count.races > 0) return { success: false, errorCode: PG_ERROR_CODES.CATEGORY_IN_USE };
  try {
    await remove();
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return { success: false, errorCode: PG_ERROR_CODES.CATEGORY_IN_USE };
    }
    throw error;
  }
}

export async function deleteAgeCategory(id: string, owner: CategoryOwner) {
  const category = await prisma.raceCategory.findFirst({
    where: { id, ...ownerWhere(owner) },
    include: { _count: { select: { races: true } } }
  });
  return deleteChecked(category, () => prisma.raceCategory.delete({ where: { id } }));
}

export async function deleteGenderCategory(id: string, owner: CategoryOwner) {
  const category = await prisma.raceCategoryGender.findFirst({
    where: { id, ...ownerWhere(owner) },
    include: { _count: { select: { races: true } } }
  });
  return deleteChecked(category, () => prisma.raceCategoryGender.delete({ where: { id } }));
}

export async function deleteDistanceCategory(id: string, owner: CategoryOwner) {
  const category = await prisma.raceCategoryLength.findFirst({
    where: { id, ...ownerWhere(owner) },
    include: { _count: { select: { races: true } } }
  });
  return deleteChecked(category, () => prisma.raceCategoryLength.delete({ where: { id } }));
}

export async function categoriesBelongToEvent(
  eventId: string,
  ids: { ageId: string; genderId: string; distanceId: string }
): Promise<boolean> {
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { organizationId: true } });
  if (!event) return false;
  const allowed = {
    OR: [
      { organizationId: null, eventId: null },
      ...(event.organizationId ? [{ organizationId: event.organizationId, eventId: null }] : []),
      { organizationId: null, eventId }
    ]
  };
  const [age, gender, distance] = await Promise.all([
    prisma.raceCategory.count({ where: { id: ids.ageId, ...allowed } }),
    prisma.raceCategoryGender.count({ where: { id: ids.genderId, ...allowed } }),
    prisma.raceCategoryLength.count({ where: { id: ids.distanceId, ...allowed } })
  ]);
  return age === 1 && gender === 1 && distance === 1;
}
