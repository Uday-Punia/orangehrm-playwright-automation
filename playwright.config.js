import { defineConfig, devices } from '@playwright/test';
import environmentConfig from './config/environments.js';

// Get URL from environment configuration
const { baseURL } = environmentConfig;

export default defineConfig({

  // Test folder
  testDir: './tests',

  // Run tests in parallel
  fullyParallel: true,

  // Prevent test.only in CI
  forbidOnly: !!process.env.CI,

  // Retry failed tests only in CI
  retries: process.env.CI ? 2 : 0,

  // Run 2 tests simultaneously
  workers: 2,

  // Generate HTML report
  reporter: 'html',

  // Common settings
  use: {

    // Environment URL
    baseURL: baseURL,

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Save video on failure
    video: 'retain-on-failure',

    // Capture trace on first retry
    trace: 'on-first-retry',

  },

  // Cross-browser testing
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