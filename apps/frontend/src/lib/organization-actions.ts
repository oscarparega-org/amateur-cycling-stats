'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Organization, OrganizationState } from '@acs/shared';
import { backendFetch } from './backend';
import { parseOrganizationInput } from './organization-input';
import type { Locale } from './i18n';
import { localePath, translate } from './i18n';

export type OrganizationActionState = {
  error?: string;
  values?: { name: string; description: string };
};

async function responseError(response: Response, fallback: string): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error || fallback;
  } catch {
    return fallback;
  }
}

export async function createOrganizationAction(
  locale: Locale,
  _previousState: OrganizationActionState,
  formData: FormData
): Promise<OrganizationActionState> {
  const parsed = parseOrganizationInput(formData);
  if (!parsed.success) return { error: translate(locale, parsed.error), values: parsed.values };

  const response = await backendFetch('/api/organizations', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(parsed.data)
  });
  if (!response.ok) {
    return {
      error: await responseError(response, translate(locale, 'No se pudo crear la organización.')),
      values: { name: parsed.data.name, description: parsed.data.description ?? '' }
    };
  }

  const organization = (await response.json()) as Organization;
  revalidatePath(localePath(locale, '/admin/organizations'));
  redirect(`${localePath(locale, `/admin/organizations/${organization.id}`)}?result=created`);
}

export async function updateOrganizationAction(
  locale: Locale,
  organizationId: string,
  _previousState: OrganizationActionState,
  formData: FormData
): Promise<OrganizationActionState> {
  const parsed = parseOrganizationInput(formData);
  if (!parsed.success) return { error: translate(locale, parsed.error), values: parsed.values };

  const response = await backendFetch(`/api/organizations/${organizationId}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(parsed.data)
  });
  if (!response.ok) {
    return {
      error: await responseError(response, translate(locale, 'No se pudieron guardar los cambios.')),
      values: { name: parsed.data.name, description: parsed.data.description ?? '' }
    };
  }

  revalidatePath(localePath(locale, '/admin/organizations'));
  revalidatePath(localePath(locale, `/admin/organizations/${organizationId}`));
  redirect(`${localePath(locale, `/admin/organizations/${organizationId}`)}?result=updated`);
}

export async function setOrganizationStateAction(formData: FormData): Promise<void> {
  const locale = formData.get('locale') === 'en' ? 'en' : 'es';
  const organizationId = String(formData.get('organizationId') ?? '');
  const state = String(formData.get('state') ?? '') as OrganizationState;
  if (!organizationId || !['ACTIVE', 'INACTIVE'].includes(state)) {
    redirect(`${localePath(locale, '/admin/organizations')}?result=invalid-state`);
  }

  const response = await backendFetch(`/api/organizations/${organizationId}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ state })
  });
  if (!response.ok) redirect(`${localePath(locale, `/admin/organizations/${organizationId}`)}?result=state-error`);

  revalidatePath(localePath(locale, '/admin/organizations'));
  revalidatePath(localePath(locale, `/admin/organizations/${organizationId}`));
  redirect(
    `${localePath(locale, `/admin/organizations/${organizationId}`)}?result=${state === 'ACTIVE' ? 'activated' : 'deactivated'}`
  );
}
