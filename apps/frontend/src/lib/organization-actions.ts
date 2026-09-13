'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Organization, OrganizationState } from '@acs/shared';
import { backendFetch } from './backend';
import { parseOrganizationInput } from './organization-input';

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
  _previousState: OrganizationActionState,
  formData: FormData
): Promise<OrganizationActionState> {
  const parsed = parseOrganizationInput(formData);
  if (!parsed.success) return { error: parsed.error, values: parsed.values };

  const response = await backendFetch('/api/organizations', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(parsed.data)
  });
  if (!response.ok) {
    return {
      error: await responseError(response, 'No se pudo crear la organización.'),
      values: { name: parsed.data.name, description: parsed.data.description ?? '' }
    };
  }

  const organization = (await response.json()) as Organization;
  revalidatePath('/admin/organizaciones');
  redirect(`/admin/organizaciones/${organization.id}?resultado=creada`);
}

export async function updateOrganizationAction(
  organizationId: string,
  _previousState: OrganizationActionState,
  formData: FormData
): Promise<OrganizationActionState> {
  const parsed = parseOrganizationInput(formData);
  if (!parsed.success) return { error: parsed.error, values: parsed.values };

  const response = await backendFetch(`/api/organizations/${organizationId}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(parsed.data)
  });
  if (!response.ok) {
    return {
      error: await responseError(response, 'No se pudieron guardar los cambios.'),
      values: { name: parsed.data.name, description: parsed.data.description ?? '' }
    };
  }

  revalidatePath('/admin/organizaciones');
  revalidatePath(`/admin/organizaciones/${organizationId}`);
  redirect(`/admin/organizaciones/${organizationId}?resultado=actualizada`);
}

export async function setOrganizationStateAction(formData: FormData): Promise<void> {
  const organizationId = String(formData.get('organizationId') ?? '');
  const state = String(formData.get('state') ?? '') as OrganizationState;
  if (!organizationId || !['ACTIVE', 'INACTIVE'].includes(state)) {
    redirect('/admin/organizaciones?resultado=estado-invalido');
  }

  const response = await backendFetch(`/api/organizations/${organizationId}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ state })
  });
  if (!response.ok) redirect(`/admin/organizaciones/${organizationId}?resultado=error-estado`);

  revalidatePath('/admin/organizaciones');
  revalidatePath(`/admin/organizaciones/${organizationId}`);
  redirect(`/admin/organizaciones/${organizationId}?resultado=${state === 'ACTIVE' ? 'activada' : 'desactivada'}`);
}
