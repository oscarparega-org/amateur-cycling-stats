import { RoleTypeEnum } from '@acs/shared';
import type { Route } from 'next';
import { localePath, type Locale } from './i18n';
import { safeRedirectPath } from './safe-redirect';

function isWithin(path: string, root: string): boolean {
  return path === root || path.startsWith(`${root}/`) || path.startsWith(`${root}?`) || path.startsWith(`${root}#`);
}

export function getRolePanelPath(roleType: RoleTypeEnum | null | undefined, locale: Locale): string {
  switch (roleType) {
    case RoleTypeEnum.ADMIN:
      return localePath(locale, '/admin/organizations');
    case RoleTypeEnum.ORGANIZER:
      return localePath(locale, '/organizer');
    default:
      return localePath(locale);
  }
}

export function getPostLoginPath(next: string | null | undefined, locale: Locale): Route {
  const homePath = localePath(locale);
  const requestedPath = safeRedirectPath(next, homePath);
  const panelPath = localePath(locale, '/panel');
  return (requestedPath === homePath ? panelPath : `${panelPath}?next=${encodeURIComponent(requestedPath)}`) as Route;
}

export function resolvePanelDestination(
  roleType: RoleTypeEnum | null | undefined,
  locale: Locale,
  next?: string | null
): string {
  const requestedPath = safeRedirectPath(next, '');
  const invitationPath = localePath(locale, '/accept-invitation');
  const adminPath = localePath(locale, '/admin');
  const organizerPath = localePath(locale, '/organizer');

  if (requestedPath === invitationPath) return requestedPath;
  if (roleType === RoleTypeEnum.ADMIN && isWithin(requestedPath, adminPath)) return requestedPath;
  if (roleType === RoleTypeEnum.ORGANIZER && isWithin(requestedPath, organizerPath)) return requestedPath;

  return getRolePanelPath(roleType, locale);
}
