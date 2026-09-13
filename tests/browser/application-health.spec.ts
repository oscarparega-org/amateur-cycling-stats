import { expect, test } from '@playwright/test';

test('serves the frontend and reaches the healthy backend', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Amateur Cycling Stats/);

  const response = await page.request.get('/api/health');
  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toMatchObject({ status: 'ok', database: 'connected' });
});
