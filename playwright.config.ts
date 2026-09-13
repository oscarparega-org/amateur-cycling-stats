import { defineConfig } from '@playwright/test';

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl || !new URL(databaseUrl).pathname.endsWith('_test')) {
  throw new Error('Set TEST_DATABASE_URL to a disposable PostgreSQL database ending in _test.');
}
const apiPort = Number(process.env.BROWSER_TEST_API_PORT ?? 3000);
const webPort = Number(process.env.BROWSER_TEST_WEB_PORT ?? 5179);
const apiUrl = `http://127.0.0.1:${apiPort}`;
const webUrl = `http://127.0.0.1:${webPort}`;

export default defineConfig({
  testDir: './tests/browser',
  workers: 1,
  timeout: 90_000,
  use: {
    baseURL: webUrl,
    channel: process.env.PLAYWRIGHT_CHANNEL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  webServer: [
    {
      command: 'node apps/backend/dist/index.js',
      url: `${apiUrl}/health`,
      reuseExistingServer: false,
      env: {
        NODE_ENV: 'test',
        DATABASE_URL: databaseUrl,
        PORT: String(apiPort),
        FRONTEND_URL: webUrl,
        TRUSTED_ORIGINS: webUrl,
        BETTER_AUTH_URL: apiUrl,
        BETTER_AUTH_SECRET: 'browser-test-secret-with-at-least-32-characters'
      }
    },
    {
      command: `npm exec --workspace=acs-frontend -- next start --port ${webPort}`,
      url: webUrl,
      reuseExistingServer: false,
      env: { API_URL: apiUrl, NEXT_PUBLIC_API_URL: apiUrl }
    }
  ]
});
