import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ fetch: vi.fn(), revalidate: vi.fn(), redirect: vi.fn() }));
vi.mock('./backend', () => ({ backendFetch: mocks.fetch }));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidate }));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));

import { saveCategoryAction } from './category-actions';

describe('category form optional values', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.fetch.mockResolvedValue(new Response('{}', { status: 200 }));
    mocks.redirect.mockImplementation(() => {
      throw new Error('redirect');
    });
  });

  it.each([
    ['age', { name: 'Open', fromAge: null, toAge: null }],
    ['distance', { name: 'Open', distance: null }]
  ] as const)('clears optional %s fields when editing', async (type, expected) => {
    const form = new FormData();
    form.set('name', 'Open');
    await expect(
      saveCategoryAction('en', type, '/api/categories', '/admin/categories', 'category-1', {}, form)
    ).rejects.toThrow('redirect');
    expect(mocks.fetch).toHaveBeenCalledWith(`/api/categories/${type}/category-1`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(expected)
    });
  });

  it('preserves zero while clearing an upper age bound', async () => {
    const form = new FormData();
    form.set('name', 'Open');
    form.set('fromAge', '0');
    form.set('toAge', '');
    await expect(
      saveCategoryAction('en', 'age', '/api/categories', '/admin/categories', 'category-1', {}, form)
    ).rejects.toThrow('redirect');
    expect(mocks.fetch.mock.calls[0]?.[1].body).toBe(JSON.stringify({ name: 'Open', fromAge: 0, toAge: null }));
  });

  it.each(['age', 'distance'] as const)('omits empty optional %s fields when creating', async (type) => {
    const form = new FormData();
    form.set('name', 'Open');
    await expect(
      saveCategoryAction('en', type, '/api/categories', '/admin/categories', null, {}, form)
    ).rejects.toThrow('redirect');
    expect(mocks.fetch).toHaveBeenCalledWith(`/api/categories/${type}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Open' })
    });
  });
});
