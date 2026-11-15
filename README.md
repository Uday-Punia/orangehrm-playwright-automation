# OrangeHRM Automation Testing - Playwright JavaScript

## Project Overview

This project automates functional testing of the OrangeHRM application using Playwright with JavaScript.

The framework follows the Page Object Model (POM) design pattern for better code reusability, readability, and maintenance.

Application URL: https://opensource-demo.orangehrmlive.com

## Technologies Used

- Playwright
- JavaScript
- Node.js
- Page Object Model (POM)
- Chromium, Firefox, WebKit
- HTML Reporter

## Project Structure

```text
orangehrm-playwright-automation/
├── config/
│   └── environments.js
├── pages/
│   └── loginPage.js
├── tests/
│   └── part1.spec.js
├── playwright.config.js
├── package.json
├── package-lock.json
└── README.md
```

## Part 1 - Functional Automation

Five functional test cases have been automated.

| Test ID | Test Scenario | What is verified | Status |
|---------|---------------|------------------|--------|
| TC_001 | Valid Login | User is redirected to the Dashboard after login | Passed |
| TC_002 | Invalid Login | "Invalid credentials" message is shown, user stays on the login page, and the Dashboard cannot be opened directly without logging in | Passed |
| TC_003 | PIM Navigation | PIM opens the Employee List; the PIM title, "Employee Information" heading and Search button are displayed | Passed |
| TC_004 | Verify Employee Data | The first row of the employee table shows the same Employee Id, first name and last name as the API response, and the record count matches the API total | Passed |
| TC_005 | Logout Functionality | User is returned to the login page after logout, and the PIM page cannot be opened afterwards | Passed |

TC_004 compares the table with the data returned by the employee list API instead of using a fixed employee name, because the demo data is shared and changes often.

### Execution Command

```bash
TEST_ENV=demo npx playwright test part1.spec.js
```

On Windows PowerShell:

```powershell
$env:TEST_ENV="demo"; npx playwright test part1.spec.js
```

Result: 15 tests passed (5 test cases × Chromium, Firefox and WebKit).

## Environment Configuration

The framework supports environment-based execution using the TEST_ENV variable.

Environment configuration is maintained in:

config/environments.js

Supported environments:

- demo - OrangeHRM Demo Environment
- qa - Configurable using QA_URL
- uat - Configurable using UAT_URL

The default environment is demo.

### Run Demo Environment

```bash
TEST_ENV=demo npx playwright test
```

### Run QA Environment

```bash
TEST_ENV=qa QA_URL=https://your-qa-url.example npx playwright test
```

The QA URL is a placeholder and must be replaced with a valid application URL.

### Environment Configuration Benefits

- Centralized environment management
- No hardcoded application URLs in page objects
- Easy switching between environments
- Reusable test cases
- Validation for missing environment URLs

## Parallel Execution

Playwright supports parallel test execution.

Configuration:

```javascript
fullyParallel: true,
workers: 2,
```

Two workers allow up to two tests to execute simultaneously. The demo application is a shared public server, so a low worker count keeps the load on it small.

The worker count can be adjusted based on available system resources.

### Run All Tests

```bash
TEST_ENV=demo npx playwright test
```

### Run Chromium Tests

```bash
TEST_ENV=demo npx playwright test --project=chromium
```

### Run Tests in Headed Mode

```bash
TEST_ENV=demo npx playwright test --headed
```

## Cross-Browser Testing

The framework supports:

- Chromium
- Firefox
- WebKit

Cross-browser execution helps verify application behavior across different browser engines.

## CI Configuration and Retries

The framework includes CI-specific retry settings.

```javascript
forbidOnly: !!process.env.CI,
retries: process.env.CI ? 2 : 0,
```

Local execution runs without retries.

CI execution allows up to two retries for failed tests.

This helps identify intermittent failures during automated execution.

## Screenshots, Videos and Traces

Playwright is configured to capture diagnostic evidence.

### Screenshot Configuration

```javascript
screenshot: 'only-on-failure',
```

Captures screenshots when tests fail.

### Video Configuration

```javascript
video: 'retain-on-failure',
```

Retains video recordings for failed tests.

### Trace Configuration

```javascript
trace: 'on-first-retry',
```

Records a trace during the first retry.

These features help investigate failed test cases and unexpected application behavior.

The settings are configured, but failure artifacts have not been separately verified.

## HTML Reporting

The framework uses Playwright's built-in HTML Reporter.

Configuration:

```javascript
reporter: 'html',
```

### Generate Test Results

```bash
TEST_ENV=demo npx playwright test
```

### Open HTML Report

```bash
npx playwright show-report
```

The HTML report provides:

- Test execution status
- Passed and failed test details
- Execution duration
- Browser information
- Available failure attachments

## Test Execution Summary

| Test Suite | Total Tests | Result |
|------------|-------------|--------|
| Part 1 - Functional Testing | 5 | Passed |
| Total | 5 | 5 Passed |

The above results were verified in the demo environment.

All tests were verified in Chromium, Firefox and WebKit (15 of 15 runs passed).

## Installation and Setup

### Prerequisites

- Node.js
- npm
- Visual Studio Code (optional)

### Install Dependencies

```bash
npm install
```

### Install Playwright Browsers

```bash
npx playwright install
```

### Execute All Tests

```bash
TEST_ENV=demo npx playwright test
```

### View HTML Report

```bash
npx playwright show-report
```

## Framework Design Decisions

### Page Object Model

Used to separate reusable page actions from test cases.

### Environment Configuration

Used to manage application URLs centrally and support multiple environments.

### Parallel Execution

Used to reduce overall test execution time.

### Cross-Browser Testing

Used to validate functionality across different browser engines.

### CI Retries

Used to help investigate intermittent failures in CI environments.

### HTML Reporting

Used to provide clear test execution results and debugging information.

### Failure Diagnostics

Screenshots, videos, and traces are configured to support failure investigation.

## Conclusion

This project demonstrates functional automation using Playwright with JavaScript.

It includes:

- Page Object Model
- Functional Test Automation
- Environment Configuration
- Parallel Execution
- Cross-Browser Testing
- CI Retry Configuration
- HTML Reporting
- Screenshot, Video and Trace Configuration

A total of 5 automated test cases have been verified successfully using the demo environment in Chromium, Firefox and WebKit.