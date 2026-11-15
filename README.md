# OrangeHRM Automation Testing - Playwright JavaScript

## Project Overview

This project automates functional and edge-case testing of the OrangeHRM application using Playwright with JavaScript.

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
│   ├── part1.spec.js
│   └── part2.spec.js
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

## Part 2 - Edge Case Identification and Automation

Selected Workflow: Employee Search in PIM Module.

EC_001 and EC_002 are basic negative checks. EC_003 to EC_006 are non-obvious cases that were found by exploring how the Employee Name and Employee Id fields behave.

| Test ID | Scenario | Expected Behavior | Actual Behavior | Status |
|---------|----------|-------------------|-----------------|--------|
| EC_001 | Search for an employee name that does not exist (XYZ98765) | "No Records Found" is shown without errors | "No Records Found" is shown | Automated |
| EC_002 | Enter special characters (@#$%) in Employee Name and search | Input is handled safely and "No Records Found" is shown | "No Records Found" is shown and the page keeps working | Automated |
| EC_003 | Enter an existing first name with spaces before and after, do not select a suggestion, and search | Spaces are ignored and the employee is found | The suggestion list ignores the spaces and shows the employee, but Search keeps the spaces and shows "No Records Found" | Automated (bug found) |
| EC_004 | Enter an Employee Id with 11 digits (12345678901) and search | A validation message, or no results | An "Invalid Parameter" error is shown and the table is emptied, but the record count still shows the old number of records | Automated (bug found) |
| EC_005 | Enter only part of a first name, do not select a suggestion, and search | User must select a suggestion, or a partial search is done | A partial search is done and matching employees are shown | Documented - Not Automated |
| EC_006 | Enter an existing Employee Id without its last digit and search | Partial match, the same as for names | Employee Id search only matches the full Id, so "No Records Found" is shown | Documented - Not Automated |

EC_003 and EC_004 show real defects: in EC_003 the same input is handled differently by the suggestion list and by Search, and in EC_004 the table and the record count show different information.

EC_005 and EC_006 show that name search and Employee Id search follow different matching rules, which is not explained anywhere on the page.

The automated tests use the first employee in the table instead of a fixed name, because the demo data is shared and changes often.

### Execution Command

```bash
TEST_ENV=demo npx playwright test part2.spec.js
```

On Windows PowerShell:

```powershell
$env:TEST_ENV="demo"; npx playwright test part2.spec.js
```

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
| Part 2 - Edge Case Testing | 4 | Passed |
| Total | 9 | 9 Passed |

The above results were verified in the demo environment in Chromium, Firefox and WebKit.

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

This project demonstrates functional automation and edge-case testing using Playwright with JavaScript.

It includes:

- Page Object Model
- Functional Test Automation
- Edge Case Automation
- Environment Configuration
- Parallel Execution
- Cross-Browser Testing
- CI Retry Configuration
- HTML Reporting
- Screenshot, Video and Trace Configuration

A total of 9 automated test cases (5 functional and 4 edge cases) have been verified successfully using the demo environment in Chromium, Firefox and WebKit.