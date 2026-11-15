import { defineConfig, devices } from '@playwright/test';
import environmentConfig from './config/environments.js';

const { baseURL } = environmentConfig;

export default defineConfig({

  testDir: './tests',

  fullyParallel: true,

  // Prevent test.only in CI
  forbidOnly: !!process.env.CI,

  // Retry failed tests only in CI
  retries: process.env.CI ? 2 : 0,

  workers: 2,

  // 60 seconds per test (demo site is slow sometimes)
  timeout: 60000,

  // 10 seconds for each check
  expect: { timeout: 10000 },

  reporter: 'html',

  use: {

    baseURL: baseURL,

    screenshot: 'only-on-failure',

    video: 'retain-on-failure',

    trace: 'retain-on-failure',

  },

  projects: [

    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

  ],

});