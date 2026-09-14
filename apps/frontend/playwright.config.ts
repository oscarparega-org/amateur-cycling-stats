import { defineConfig, devices } from '@playwright/test';

const webPort = Number(process.env.FRONTEND_E2E_PORT ?? 5180);
const baseURL = `http://127.0.0.1:${webPort}`;

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 1,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } }
  ],
  webServer: {
    command: `npm run dev -- --port ${webPort}`,
    url: `${baseURL}/es/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
