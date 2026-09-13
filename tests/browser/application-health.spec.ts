import { expect, test } from '@playwright/test';

test('serves the frontend and reaches the healthy backend', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Próximos eventos.*Amateur Cycling Stats/);
  await expect(page.getByRole('heading', { name: 'Próximos eventos' })).toBeVisible();
  await expect(page.getByText('No hay próximos eventos')).toBeVisible();

  const response = await page.request.get('/api/health');
  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toMatchObject({ status: 'ok', database: 'connected' });
});

test('shows a useful not-found page for an unknown event', async ({ page }) => {
  const response = await page.goto('/eventos/00000000-0000-4000-8000-000000000000');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Evento no encontrado' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver próximos eventos' })).toHaveAttribute('href', '/');
});
