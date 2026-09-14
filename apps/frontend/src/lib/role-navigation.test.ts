import { RoleTypeEnum } from '@acs/shared';
import { describe, expect, it } from 'vitest';
import { getPostLoginPath, getRolePanelPath, resolvePanelDestination } from './role-navigation';

describe('role navigation', () => {
  it.each([
    [RoleTypeEnum.ADMIN, '/es/admin/organizations'],
    [RoleTypeEnum.ORGANIZER, '/es/organizer'],
    [RoleTypeEnum.CYCLIST, '/es'],
    [RoleTypeEnum.PUBLIC, '/es']
  ])('maps %s to its available panel', (roleType, destination) => {
    expect(getRolePanelPath(roleType, 'es')).toBe(destination);
  });

  it('routes a normal login through the role resolver', () => {
    expect(getPostLoginPath('/en', 'en')).toBe('/en/panel');
    expect(getPostLoginPath('/es/organizer/events', 'es')).toBe('/es/panel?next=%2Fes%2Forganizer%2Fevents');
  });

  it('preserves authorized panel deep links', () => {
    expect(resolvePanelDestination(RoleTypeEnum.ADMIN, 'en', '/en/admin/organizations/new')).toBe(
      '/en/admin/organizations/new'
    );
    expect(resolvePanelDestination(RoleTypeEnum.ORGANIZER, 'es', '/es/organizer')).toBe('/es/organizer');
  });

  it('does not send a user into another role panel', () => {
    expect(resolvePanelDestination(RoleTypeEnum.ORGANIZER, 'es', '/es/admin/organizations')).toBe('/es/organizer');
    expect(resolvePanelDestination(RoleTypeEnum.CYCLIST, 'en', '/en/organizer')).toBe('/en');
    expect(resolvePanelDestination(RoleTypeEnum.ADMIN, 'en', '/en/administrator')).toBe('/en/admin/organizations');
  });

  it('preserves the organizer invitation continuation', () => {
    expect(resolvePanelDestination(RoleTypeEnum.PUBLIC, 'en', '/en/accept-invitation')).toBe('/en/accept-invitation');
  });
});
