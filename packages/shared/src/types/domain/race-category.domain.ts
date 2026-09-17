export type CategoryScope =
  | { scope: 'GLOBAL'; organizationId: null; eventId: null }
  | { scope: 'ORGANIZATION'; organizationId: string; eventId: null }
  | { scope: 'EVENT'; organizationId: null; eventId: string };

interface RaceCategoryBase {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RaceCategoryAge = RaceCategoryBase &
  CategoryScope & {
    fromAge: number | null;
    toAge: number | null;
  };

export type RaceCategoryGender = RaceCategoryBase & CategoryScope;

export type RaceCategoryDistance = RaceCategoryBase & CategoryScope & { distance: number | null };

export interface ScopedCategoryCollection<T> {
  global: T[];
  organization: T[];
  event: T[];
}

export interface AvailableCategories {
  age: ScopedCategoryCollection<RaceCategoryAge>;
  gender: ScopedCategoryCollection<RaceCategoryGender>;
  distance: ScopedCategoryCollection<RaceCategoryDistance>;
}
