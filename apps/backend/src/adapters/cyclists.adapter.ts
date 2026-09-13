import type { Cyclist } from '@acs/shared';
import { RoleTypeEnum } from '@acs/shared';
import type { Cyclist as PrismaCyclist, User, CyclistGender, Role } from '@prisma/client';

type PrismaCyclistWithRelations = PrismaCyclist & {
  user: User & { role: Role | null };
  gender: CyclistGender | null;
};

export function adaptCyclist(cyclist: PrismaCyclistWithRelations): Cyclist {
  return {
    id: cyclist.id,
    firstName: cyclist.user.firstName ?? '',
    lastName: cyclist.user.lastName ?? '',
    email: cyclist.user.email,
    roleType: cyclist.user.role?.name === 'CYCLIST' ? RoleTypeEnum.CYCLIST : null,
    status: cyclist.user.status,
    genderName: cyclist.gender?.name ?? null,
    bornYear: cyclist.bornYear,
    createdAt: cyclist.createdAt.toISOString(),
    updatedAt: cyclist.updatedAt.toISOString()
  };
}

export const cyclistInclude = {
  user: { include: { role: true } },
  gender: true
} as const;
