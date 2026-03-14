import type { OrganizationState } from '../../enums/status.enum.js';

export interface Organization {
  id: string;
  name: string;
  description: string | null;
  state: OrganizationState;
  eventCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type PartialOrganization = Partial<Pick<Organization, 'name' | 'description' | 'state'>>;
