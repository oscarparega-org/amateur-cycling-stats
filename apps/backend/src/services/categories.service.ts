import type { RaceCategoryAge, RaceCategoryGender, RaceCategoryDistance } from '@acs/shared';
import { PG_ERROR_CODES } from '@acs/shared';
import { prisma } from '../lib/prisma.js';
import {
  adaptAgeCategory,
  adaptGenderCategory,
  adaptDistanceCategory
} from '../adapters/categories.adapter.js';

// === Age Categories ===

export async function getAgeCategories(organizationId?: string): Promise<RaceCategoryAge[]> {
  const cats = await prisma.raceCategory.findMany({
    where: organizationId
      ? { OR: [{ isGlobal: true }, { organizationId }] }
      : { isGlobal: true },
    orderBy: { name: 'asc' }
  });
  return cats.map(adaptAgeCategory);
}

export async function createAgeCategory(data: {
  name: string;
  fromAge?: number;
  toAge?: number;
  organizationId?: string;
}): Promise<RaceCategoryAge> {
  const cat = await prisma.raceCategory.create({
    data: {
      name: data.name,
      fromAge: data.fromAge ?? null,
      toAge: data.toAge ?? null,
      isGlobal: !data.organizationId,
      isDefault: false,
      organizationId: data.organizationId ?? null
    }
  });
  return adaptAgeCategory(cat);
}

export async function updateAgeCategory(
  id: string,
  data: { name?: string; fromAge?: number | null; toAge?: number | null }
): Promise<RaceCategoryAge | null> {
  const cat = await prisma.raceCategory.findUnique({ where: { id } });
  if (!cat) return null;
  const updated = await prisma.raceCategory.update({ where: { id }, data });
  return adaptAgeCategory(updated);
}

export async function deleteAgeCategory(id: string): Promise<{ success: boolean; errorCode?: string }> {
  const cat = await prisma.raceCategory.findUnique({
    where: { id },
    include: { _count: { select: { races: true } } }
  });
  if (!cat) return { success: false, errorCode: 'NOT_FOUND' };
  if (cat.isDefault) return { success: false, errorCode: PG_ERROR_CODES.PROTECTED_CATEGORY };
  if (cat._count.races > 0) return { success: false, errorCode: PG_ERROR_CODES.CATEGORY_IN_USE };
  await prisma.raceCategory.delete({ where: { id } });
  return { success: true };
}

// === Gender Categories ===

export async function getGenderCategories(organizationId?: string): Promise<RaceCategoryGender[]> {
  const cats = await prisma.raceCategoryGender.findMany({
    where: organizationId
      ? { OR: [{ isGlobal: true }, { organizationId }] }
      : { isGlobal: true },
    orderBy: { name: 'asc' }
  });
  return cats.map(adaptGenderCategory);
}

export async function createGenderCategory(data: {
  name: string;
  organizationId?: string;
}): Promise<RaceCategoryGender> {
  const cat = await prisma.raceCategoryGender.create({
    data: {
      name: data.name,
      isGlobal: !data.organizationId,
      isDefault: false,
      organizationId: data.organizationId ?? null
    }
  });
  return adaptGenderCategory(cat);
}

export async function updateGenderCategory(
  id: string,
  data: { name?: string }
): Promise<RaceCategoryGender | null> {
  const cat = await prisma.raceCategoryGender.findUnique({ where: { id } });
  if (!cat) return null;
  const updated = await prisma.raceCategoryGender.update({ where: { id }, data });
  return adaptGenderCategory(updated);
}

export async function deleteGenderCategory(id: string): Promise<{ success: boolean; errorCode?: string }> {
  const cat = await prisma.raceCategoryGender.findUnique({
    where: { id },
    include: { _count: { select: { races: true } } }
  });
  if (!cat) return { success: false, errorCode: 'NOT_FOUND' };
  if (cat.isDefault) return { success: false, errorCode: PG_ERROR_CODES.PROTECTED_CATEGORY };
  if (cat._count.races > 0) return { success: false, errorCode: PG_ERROR_CODES.CATEGORY_IN_USE };
  await prisma.raceCategoryGender.delete({ where: { id } });
  return { success: true };
}

// === Distance Categories ===

export async function getDistanceCategories(organizationId?: string): Promise<RaceCategoryDistance[]> {
  const cats = await prisma.raceCategoryLength.findMany({
    where: organizationId
      ? { OR: [{ isGlobal: true }, { organizationId }] }
      : { isGlobal: true },
    orderBy: { name: 'asc' }
  });
  return cats.map(adaptDistanceCategory);
}

export async function createDistanceCategory(data: {
  name: string;
  distance?: number;
  organizationId?: string;
}): Promise<RaceCategoryDistance> {
  const cat = await prisma.raceCategoryLength.create({
    data: {
      name: data.name,
      distance: data.distance ?? null,
      isGlobal: !data.organizationId,
      isDefault: false,
      organizationId: data.organizationId ?? null
    }
  });
  return adaptDistanceCategory(cat);
}

export async function updateDistanceCategory(
  id: string,
  data: { name?: string; distance?: number | null }
): Promise<RaceCategoryDistance | null> {
  const cat = await prisma.raceCategoryLength.findUnique({ where: { id } });
  if (!cat) return null;
  const updated = await prisma.raceCategoryLength.update({ where: { id }, data });
  return adaptDistanceCategory(updated);
}

// Raw lookups for auth checks (returns Prisma object, not domain type)
export async function getAgeCategoryRaw(id: string) {
  return prisma.raceCategory.findUnique({ where: { id } });
}
export async function getGenderCategoryRaw(id: string) {
  return prisma.raceCategoryGender.findUnique({ where: { id } });
}
export async function getDistanceCategoryRaw(id: string) {
  return prisma.raceCategoryLength.findUnique({ where: { id } });
}

export async function deleteDistanceCategory(id: string): Promise<{ success: boolean; errorCode?: string }> {
  const cat = await prisma.raceCategoryLength.findUnique({
    where: { id },
    include: { _count: { select: { races: true } } }
  });
  if (!cat) return { success: false, errorCode: 'NOT_FOUND' };
  if (cat.isDefault) return { success: false, errorCode: PG_ERROR_CODES.PROTECTED_CATEGORY };
  if (cat._count.races > 0) return { success: false, errorCode: PG_ERROR_CODES.CATEGORY_IN_USE };
  await prisma.raceCategoryLength.delete({ where: { id } });
  return { success: true };
}
