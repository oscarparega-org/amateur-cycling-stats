import { expect, test } from '@playwright/test';

test('serves the frontend and reaches the healthy backend', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/en$/);
  await expect(page).toHaveTitle(/Upcoming events.*Amateur Cycling Stats/);
  await expect(page.getByRole('heading', { name: 'Upcoming events' })).toBeVisible();
  await expect(page.getByText('No upcoming events')).toBeVisible();

  const response = await page.request.get('/api/health');
  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toMatchObject({ status: 'ok', database: 'connected' });
});

test('shows a useful not-found page for an unknown event', async ({ page }) => {
  const response = await page.goto('/es/events/00000000-0000-4000-8000-000000000000');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Evento no encontrado' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver próximos eventos' })).toHaveAttribute('href', '/es');
});
