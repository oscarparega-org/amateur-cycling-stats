export interface Race {
  id: string;
  name: string | null;
  description: string | null;
  dateTime: string;
  eventId: string;
  raceCategoryAgeId: string;
  raceCategoryGenderId: string;
  raceCategoryDistanceId: string;
  raceCategoryAgeName: string;
  raceCategoryGenderName: string;
  raceCategoryDistanceName: string;
  isPublicVisible: boolean;
  createdAt: string;
  updatedAt: string;
}
