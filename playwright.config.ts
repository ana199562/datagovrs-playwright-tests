import { defineConfig, devices } from '@playwright/test';
import { env } from './src/env';

// data.gov.rs is a live government site, so only 2 workers and no retries locally.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: env.isCI,
  retries: env.isCI ? 1 : 0,
  workers: 2,
  timeout: 45_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: env.baseUrl,
    locale: 'sr-RS',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'unit', testDir: './tests/unit' },
    { name: 'api', testDir: './tests/api' },
    { name: 'ui', testDir: './tests/ui', use: { ...devices['Desktop Chrome'], locale: 'sr-RS' } },
  ],
});
