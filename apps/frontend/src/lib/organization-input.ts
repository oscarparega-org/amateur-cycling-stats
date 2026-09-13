export type OrganizationInput = {
  name: string;
  description: string | null;
};

export type OrganizationInputResult =
  | { success: true; data: OrganizationInput }
  | { success: false; error: string; values: { name: string; description: string } };

export function parseOrganizationInput(formData: FormData): OrganizationInputResult {
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const values = { name, description };

  if (!name) return { success: false, error: 'Escribe el nombre de la organización.', values };
  if (name.length < 3) {
    return { success: false, error: 'El nombre debe tener al menos 3 caracteres.', values };
  }
  if (name.length > 120) {
    return { success: false, error: 'El nombre no puede superar los 120 caracteres.', values };
  }
  if (description.length > 1000) {
    return { success: false, error: 'La descripción no puede superar los 1,000 caracteres.', values };
  }

  return { success: true, data: { name, description: description || null } };
}
