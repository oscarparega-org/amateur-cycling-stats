import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { RoleTypeEnum } from '@acs/shared';
import { prisma } from './prisma.js';

/**
 * Get the authenticated user from context, or null if not authenticated.
 */
export function getAuthUser(c: Context) {
  return c.get('user') ?? null;
}

/**
 * Require authentication. Returns the user or throws 401.
 */
export function requireAuth(c: Context) {
  const user = getAuthUser(c);
  if (!user) throw new HTTPException(401, { message: 'Authentication required' });
  return user;
}

/**
 * Require the user to have one of the specified roles. Returns the user or throws 401/403.
 * Queries the Role table to check the user's role name.
 */
export async function requireRole(c: Context, allowedRoles: RoleTypeEnum[]) {
  const user = requireAuth(c);
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true }
  });
  if (!dbUser?.role) throw new HTTPException(403, { message: 'Forbidden' });
  if (!allowedRoles.includes(dbUser.role.name as RoleTypeEnum)) {
    throw new HTTPException(403, { message: 'Forbidden' });
  }
  return { ...user, roleName: dbUser.role.name as RoleTypeEnum };
}

/**
 * Check if the user is an admin (without throwing).
 */
export async function isAdmin(c: Context): Promise<boolean> {
  const user = getAuthUser(c);
  if (!user) return false;
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true }
  });
  return dbUser?.role?.name === RoleTypeEnum.ADMIN;
}

/**
 * Check whether the current user may manage an organization without throwing.
 * Used by read routes to decide whether private records can be included.
 */
export async function canManageOrganization(c: Context, organizationId: string): Promise<boolean> {
  const user = getAuthUser(c);
  if (!user) return false;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true }
  });
  if (dbUser?.role?.name === RoleTypeEnum.ADMIN) return true;
  if (dbUser?.role?.name !== RoleTypeEnum.ORGANIZER) return false;

  return Boolean(
    await prisma.organizer.findFirst({
      where: { userId: user.id, organizationId },
      select: { id: true }
    })
  );
}

/** Check whether the current user may manage a specific event. */
export async function canManageEvent(c: Context, eventId: string): Promise<boolean> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { organizationId: true }
  });
  if (!event) return false;
  if (event.organizationId) return canManageOrganization(c, event.organizationId);
  return isAdmin(c);
}

/** Check whether the current user may manage a race through its parent event. */
export async function canManageRace(c: Context, raceId: string): Promise<boolean> {
  const race = await prisma.race.findUnique({
    where: { id: raceId },
    select: { eventId: true }
  });
  return race ? canManageEvent(c, race.eventId) : false;
}

/**
 * Require the user to be an organizer in the specified organization, or an admin.
 */
export async function requireOrgMember(c: Context, organizationId: string) {
  const user = requireAuth(c);
  // Admins bypass org check
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true }
  });
  if (dbUser?.role?.name === RoleTypeEnum.ADMIN) return user;

  if (dbUser?.role?.name !== RoleTypeEnum.ORGANIZER) {
    throw new HTTPException(403, { message: 'Forbidden' });
  }

  // Must be in the specific organization
  const organizer = await prisma.organizer.findFirst({
    where: { userId: user.id, organizationId }
  });
  if (!organizer) throw new HTTPException(403, { message: 'Forbidden' });
  return user;
}

/**
 * Require the user to be an organizer in the event's organization, or an admin.
 * Looks up the event to find its organizationId.
 */
export async function requireEventOrgMember(c: Context, eventId: string) {
  const user = requireAuth(c);
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true }
  });
  if (dbUser?.role?.name === RoleTypeEnum.ADMIN) return user;

  if (dbUser?.role?.name !== RoleTypeEnum.ORGANIZER) {
    throw new HTTPException(403, { message: 'Forbidden' });
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event?.organizationId) throw new HTTPException(403, { message: 'Forbidden' });

  const organizer = await prisma.organizer.findFirst({
    where: { userId: user.id, organizationId: event.organizationId }
  });
  if (!organizer) throw new HTTPException(403, { message: 'Forbidden' });
  return user;
}
