export interface RaceResult {
  id: string;
  place: number;
  time: string | null;
  eventId: string;
  raceId: string;
  raceCategoryAgeId: string;
  raceCategoryGenderId: string;
  raceCategoryDistanceId: string;
  eventName: string;
  eventDateTime: string;
  eventYear: number;
  eventCity: string;
  eventState: string;
  eventCountry: string;
  eventStatus: string;
  raceName: string | null;
  raceDateTime: string;
  raceCategoryType: string;
  raceCategoryGenderType: string;
  raceCategoryDistanceType: string;
  createdAt: string;
  updatedAt: string;
}
