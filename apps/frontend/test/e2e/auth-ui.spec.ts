import { expect, test } from '@playwright/test';

test('presents the complete sign-in entry point', async ({ page }) => {
  await page.goto('/iniciar-sesion');
  await expect(page.getByRole('heading', { name: 'Vuelve a la ruta' })).toBeVisible();
  await expect(page.getByLabel('Correo electrónico')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Contraseña', exact: true })).toHaveAttribute('type', 'password');
  await page.getByRole('button', { name: 'Mostrar contraseña' }).click();
  await expect(page.getByRole('textbox', { name: 'Contraseña', exact: true })).toHaveAttribute('type', 'text');
  await expect(page.getByRole('button', { name: 'Continuar con Google' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Crear cuenta' })).toBeVisible();
});

test('shows password mismatch guidance during registration', async ({ page }) => {
  await page.goto('/registro');
  await page.getByLabel('Nombre').fill('Ana');
  await page.getByLabel('Apellido').fill('Rueda');
  await page.getByLabel('Correo electrónico').fill('ana@example.com');
  await page.getByLabel('Contraseña', { exact: true }).fill('password123');
  await page.getByLabel('Confirmar contraseña').fill('different123');
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page.locator('[role="alert"]').filter({ hasText: 'Las contraseñas no coinciden.' })).toBeVisible();
});

test('handles a reset link without a token', async ({ page }) => {
  await page.goto('/restablecer-contrasena?error=INVALID_TOKEN');
  await expect(page.locator('[role="alert"]').filter({ hasText: 'ya no es válido' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Solicitar otro enlace' })).toBeVisible();
});

test('keeps the auth form usable at the mobile viewport', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile'), 'Mobile-only layout assertion');
  await page.goto('/registro');
  await expect(page.locator('aside')).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Toma la salida' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Crear cuenta' })).toBeVisible();
});
