export interface RaceCategoryAge {
  id: string;
  name: string;
  fromAge: number | null;
  toAge: number | null;
  isGlobal: boolean;
  isDefault: boolean;
  organizationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RaceCategoryGender {
  id: string;
  name: string;
  isGlobal: boolean;
  isDefault: boolean;
  organizationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RaceCategoryDistance {
  id: string;
  name: string;
  distance: number | null;
  isGlobal: boolean;
  isDefault: boolean;
  organizationId: string | null;
  createdAt: string;
  updatedAt: string;
}
