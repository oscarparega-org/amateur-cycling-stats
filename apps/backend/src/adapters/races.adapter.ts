import type { Race } from '@acs/shared';
import type {
  Race as PrismaRace,
  RaceCategory,
  RaceCategoryGender,
  RaceCategoryLength
} from '@prisma/client';

type PrismaRaceWithCategories = PrismaRace & {
  categoryAge: RaceCategory;
  categoryGender: RaceCategoryGender;
  categoryDistance: RaceCategoryLength;
};

export function adaptRace(race: PrismaRaceWithCategories): Race {
  return {
    id: race.id,
    name: race.name,
    description: race.description,
    dateTime: race.dateTime.toISOString(),
    eventId: race.eventId,
    raceCategoryAgeId: race.raceCategoryAgeId,
    raceCategoryGenderId: race.raceCategoryGenderId,
    raceCategoryDistanceId: race.raceCategoryDistanceId,
    raceCategoryAgeName: race.categoryAge.name,
    raceCategoryGenderName: race.categoryGender.name,
    raceCategoryDistanceName: race.categoryDistance.name,
    isPublicVisible: race.isPublicVisible,
    createdAt: race.createdAt.toISOString(),
    updatedAt: race.updatedAt.toISOString()
  };
}

export const raceInclude = {
  categoryAge: true,
  categoryGender: true,
  categoryDistance: true
} as const;
