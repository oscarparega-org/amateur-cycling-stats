import type { RaceResult } from '@acs/shared';
import type {
  RaceResult as PrismaRaceResult,
  Race,
  Event,
  RaceCategory,
  RaceCategoryGender,
  RaceCategoryLength,
  Cyclist,
  User
} from '@prisma/client';

type PrismaRaceResultWithRelations = PrismaRaceResult & {
  race: Race & {
    event: Event;
    categoryAge: RaceCategory;
    categoryGender: RaceCategoryGender;
    categoryDistance: RaceCategoryLength;
  };
  cyclist: Cyclist & { user: User };
};

export function adaptRaceResult(result: PrismaRaceResultWithRelations): RaceResult {
  const { race } = result;
  return {
    id: result.id,
    place: result.place,
    time: result.time,
    cyclistId: result.cyclistId,
    eventId: race.eventId,
    raceId: result.raceId,
    raceCategoryAgeId: race.raceCategoryAgeId,
    raceCategoryGenderId: race.raceCategoryGenderId,
    raceCategoryDistanceId: race.raceCategoryDistanceId,
    eventName: race.event.name,
    eventDateTime: race.event.dateTime.toISOString(),
    eventYear: race.event.year,
    eventCity: race.event.city ?? '',
    eventState: race.event.state,
    eventCountry: race.event.country,
    eventStatus: race.event.eventStatus,
    raceName: `${race.categoryAge.name} - ${race.categoryGender.name} - ${race.categoryDistance.name}`,
    raceDateTime: race.dateTime.toISOString(),
    raceCategoryType: race.categoryAge.name,
    raceCategoryGenderType: race.categoryGender.name,
    raceCategoryDistanceType: race.categoryDistance.name,
    createdAt: result.createdAt.toISOString(),
    updatedAt: result.updatedAt.toISOString()
  };
}

export const raceResultInclude = {
  race: {
    include: {
      event: true,
      categoryAge: true,
      categoryGender: true,
      categoryDistance: true
    }
  },
  cyclist: {
    include: { user: true }
  }
} as const;
