import type { RaceCategoryAge, RaceCategoryDistance, RaceCategoryGender } from '@acs/shared';

export const categoryTypes = ['age', 'gender', 'distance'] as const;
export type CategoryType = (typeof categoryTypes)[number];
export type Category = RaceCategoryAge | RaceCategoryGender | RaceCategoryDistance;

export type CategoryContext = {
  scope: 'GLOBAL' | 'ORGANIZATION' | 'EVENT';
  basePath: string;
  apiBase: string;
  title: string;
  eventBasePath?: string;
  inherited: Array<{ label: string; apiBase: string }>;
};

export function isCategoryType(value: string | undefined): value is CategoryType {
  return categoryTypes.includes(value as CategoryType);
}

export function categoryTypeLabel(type: CategoryType) {
  if (type === 'age') return 'Edad';
  if (type === 'gender') return 'Género';
  return 'Distancia';
}

export function categoryValue(category: Category, type: CategoryType) {
  if (type === 'age') {
    const age = category as RaceCategoryAge;
    if (age.fromAge === null && age.toAge === null) return '—';
    if (age.fromAge === null) return `≤ ${age.toAge}`;
    if (age.toAge === null) return `${age.fromAge}+`;
    return `${age.fromAge}–${age.toAge}`;
  }
  if (type === 'distance') {
    const distance = (category as RaceCategoryDistance).distance;
    return distance === null ? '—' : `${distance} km`;
  }
  return '—';
}
