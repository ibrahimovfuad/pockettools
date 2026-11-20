// Smoke tests: every app opens in an iPhone-sized WebKit window without script errors.
// Run with "npm run test:smoke" (first time: "npx playwright install --with-deps webkit").
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { ...devices['iPhone 13'], screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: [{ name: 'iphone-webkit', use: { browserName: 'webkit' } }]
});
