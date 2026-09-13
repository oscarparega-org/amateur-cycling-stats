import { describe, expect, it } from 'vitest';
import { parseOrganizationInput } from './organization-input';

function form(values: Record<string, string>) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

describe('parseOrganizationInput', () => {
  it('trims valid organization data and normalizes an empty description', () => {
    expect(parseOrganizationInput(form({ name: '  Club del Norte  ', description: '   ' }))).toEqual({
      success: true,
      data: { name: 'Club del Norte', description: null }
    });
  });

  it('rejects short names', () => {
    expect(parseOrganizationInput(form({ name: 'AC', description: '' }))).toMatchObject({
      success: false,
      error: 'El nombre debe tener al menos 3 caracteres.'
    });
  });
});
