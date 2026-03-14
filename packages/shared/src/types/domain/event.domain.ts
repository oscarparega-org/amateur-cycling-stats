import type { EventStatus } from '../../enums/status.enum.js';

export interface Event {
  id: string;
  name: string;
  description: string | null;
  dateTime: string;
  year: number;
  city: string | null;
  state: string;
  country: string;
  eventStatus: EventStatus;
  organizationId: string | null;
  createdBy: string | null;
  isPublicVisible: boolean;
  createdAt: string;
  updatedAt: string;
}
