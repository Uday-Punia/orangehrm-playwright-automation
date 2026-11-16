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
│   ├── loginPage.js
│   └── PIMPage.js
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
npx playwright test tests/part1.spec.js
```

Result: 15 tests passed (5 test cases × Chromium, Firefox and WebKit).

## Part 2 - Edge Case Identification and Automation

Selected Workflow: Employee Search in PIM Module.

EC_001 and EC_002 are basic negative checks. EC_003 to EC_006 are non-obvious cases that were found by exploring how the Employee Name and Employee Id fields behave.

| Test ID | Scenario | Expected Behavior | Actual Behavior | Status |
|---------|----------|-------------------|-----------------|--------|
| EC_001 | Search for an employee name that does not exist (XYZ98765) | "No Records Found" is shown without errors | "No Records Found" is shown | Automated |
| EC_002 | Enter special characters (<>{}~^) in Employee Name and search | Input is handled safely and "No Records Found" is shown | "No Records Found" is shown and the page keeps working | Automated |
| EC_003 | Enter an existing first name with spaces before and after, do not select a suggestion, and search | Spaces are ignored and the employee is found | The suggestion list ignores the spaces and shows the employee, but Search keeps the spaces and shows "No Records Found" | Automated (bug found) |
| EC_004 | Enter an Employee Id with 11 digits (12345678901) and search | A validation message, or no results | An "Invalid Parameter" error is shown and the table is emptied, but the record count still shows the old number of records | Automated (bug found) |
| EC_005 | Enter only part of a first name, do not select a suggestion, and search | User must select a suggestion, or a partial search is done | A partial search is done and matching employees are shown | Documented - Not Automated |
| EC_006 | Enter an existing Employee Id without its last digit and search | Partial match, the same as for names | Employee Id search only matches the full Id, so "No Records Found" is shown | Documented - Not Automated |

EC_003 and EC_004 show real defects: in EC_003 the same input is handled differently by the suggestion list and by Search, and in EC_004 the table and the record count show different information.

EC_005 and EC_006 show that name search and Employee Id search follow different matching rules, which is not explained anywhere on the page.

EC_003 uses the first employee in the table instead of a fixed name, because the demo data is shared and changes often.

### Network Failure Test

| Test ID | Scenario | Expected Behavior | Actual Behavior | Status |
|---------|----------|-------------------|-----------------|--------|
| NET_001 | Block the employee list request with page.route() and route.abort() | Page keeps working and shows an empty result or an error message | Page keeps working, shows "No Records Found" and Search can still be used, but no error message is shown | Automated |

page.route() catches the request that loads the employee list, and route.abort() makes it fail in the same way as a lost network connection. The page is then reloaded so that it requests the list again.

Finding: when the request fails, the user sees "No Records Found" with no error message, so they cannot tell a network problem from an empty result.

### Execution Command

```bash
npx playwright test tests/part2.spec.js
```

## Environment Configuration

The framework supports environment-based execution using the TEST_ENV variable.

Environment configuration is maintained in:

config/environments.js

Supported environments:

- demo - OrangeHRM Demo Environment (uses the public demo login)
- qa - Configurable using QA_URL, QA_USERNAME and QA_PASSWORD
- uat - Configurable using UAT_URL, UAT_USERNAME and UAT_PASSWORD

Each environment has its own URL and login in config/environments.js, so the tests do not contain any credentials.

The default environment is demo.

### Run Demo Environment

The demo environment is used by default, so no variable is needed:

```bash
npx playwright test
```

### Run QA Environment

macOS / Linux:

```bash
TEST_ENV=qa QA_URL=https://your-qa-url.example QA_USERNAME=your-user QA_PASSWORD=your-password npx playwright test
```

Windows PowerShell:

```powershell
$env:TEST_ENV="qa"; $env:QA_URL="https://your-qa-url.example"; $env:QA_USERNAME="your-user"; $env:QA_PASSWORD="your-password"; npx playwright test
```

The QA URL and login are placeholders and must be replaced with valid values.

### Environment Configuration Benefits

- Centralized environment management
- No hardcoded application URLs in page objects
- Easy switching between environments
- Reusable test cases
- Validation for missing environment URLs and logins
- No credentials hardcoded in test files

## Playwright Configuration Summary

All settings are in playwright.config.js.

| Setting | Value | Reason |
|---------|-------|--------|
| fullyParallel | true | Tests are independent, so they can run at the same time |
| workers | 2 | Faster than one worker, but keeps the load small on the shared public demo server |
| retries | 2 in CI, 0 locally | CI can retry short network or server problems; locally a failure is shown straight away |
| forbidOnly | true in CI | Stops a test.only left in the code from skipping the other tests in CI |
| timeout | 60 seconds | Login and search on the demo can be slow, and 30 seconds was not always enough |
| expect timeout | 10 seconds | Each check waits up to 10 seconds for the page instead of using fixed waits |
| screenshot | only-on-failure | Shows the page at the moment a test failed |
| video | retain-on-failure | Shows the steps that led to a failure; videos of passing tests are deleted to save space |
| trace | retain-on-failure | Keeps a full step-by-step record of every failed test, locally and in CI |
| reporter | html | One report with results, errors and failure attachments |
| projects | Chromium, Firefox, WebKit | Checks the application in three browser engines |
| baseURL | from TEST_ENV | The same tests run on demo, qa or uat |

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
npx playwright test
```

### Run Chromium Tests

```bash
npx playwright test --project=chromium
```

### Run Tests in Headed Mode

```bash
npx playwright test --headed
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

## Timeouts

```javascript
timeout: 60000,
expect: { timeout: 10000 },
```

The demo application is a shared public server and is sometimes slow. With the default 30 second test timeout and 5 second check timeout, some runs failed while the employee list or the name suggestions were still loading.

Each test can now take up to 60 seconds, and each check waits up to 10 seconds. These are only the maximum times: a check continues as soon as the page is ready, so passing tests are not slower. No fixed waits such as waitForTimeout are used.

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
trace: 'retain-on-failure',
```

Keeps a trace for every failed test. A trace records each step, the page at each step, network requests and console messages.

Open a trace from the failed test in the HTML report, or with:

```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```

When a test fails, its screenshot, video and trace are saved in the test-results folder and attached to the test in the HTML report.

## HTML Reporting

The framework uses Playwright's built-in HTML Reporter.

Configuration:

```javascript
reporter: 'html',
```

### Generate Test Results

```bash
npx playwright test
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
| Part 2 - Edge Case and Network Testing | 5 | Passed |
| Total | 10 | 10 Passed |

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
npx playwright test
```

### View HTML Report

```bash
npx playwright show-report
```

## Framework Design Decisions

### Page Object Model

LoginPage and PIMPage keep the locators and actions of each page. The tests only describe the steps and checks, so if the page changes, the fix is made in one place.

### Environment Configuration

config/environments.js holds the URL and login for demo, qa and uat. TEST_ENV selects the environment, so the same tests run anywhere and no credentials are written in the test files.

### Shared Setup with beforeEach

In part2.spec.js, login and opening PIM are done once in beforeEach instead of being repeated in every test.

### Locator Strategy

getByRole, getByText and getByPlaceholder are used where possible, because they follow what the user sees and are less likely to break than CSS or XPath.

### Test Data

Tests read data from the page or the API instead of using fixed values, because the demo data changes often.

### No Fixed Waits

Playwright's built-in waiting and expect checks are used instead of waitForTimeout, so tests continue as soon as the page is ready.

### Parallel and Cross-Browser Execution

Tests run in parallel with 2 workers in Chromium, Firefox and WebKit, which keeps runs fast without overloading the demo server.

### Failure Diagnostics

Screenshots, videos and traces are saved for failed tests and attached to the HTML report, which makes it easy to see why a test failed.

## Known Limitations and Workarounds

| Limitation | Workaround |
|------------|------------|
| The demo application is a shared public server and is sometimes slow | Test timeout is 60 seconds, check timeout is 10 seconds, only 2 workers are used, and CI retries failed tests up to 2 times |
| The demo data is shared and changes often | Tests do not depend on fixed employee names. EC_003 reads the first employee from the table and TC_004 compares the table with the API response |
| EC_003 and EC_004 check the current buggy behavior | If OrangeHRM fixes these bugs, the two tests will fail and must be updated to the new behavior |
| When the employee list request fails, no error message is shown | Documented as a finding in NET_001; the test checks that the page keeps working |
| Some fields have no accessible name, so a few CSS-based locators are used | These locators are kept only in PIMPage.js, so a change in the page needs to be fixed in one place |
| Every test logs in through the login page | This is fine for 10 tests; for a larger suite, a saved login session (storageState) could be used to save time |
| Only network failure is simulated with page.route() | A test with mocked employee data (route.fulfill) could be added later |

## Conclusion

This project demonstrates functional automation and edge-case testing using Playwright with JavaScript.

It includes:

- Page Object Model
- Functional Test Automation
- Edge Case Automation
- Network Failure Testing with page.route()
- Environment Configuration
- Parallel Execution
- Cross-Browser Testing
- CI Retry Configuration
- HTML Reporting
- Screenshot, Video and Trace Configuration

A total of 10 automated test cases (5 functional, 4 edge cases and 1 network failure test) have been verified successfully using the demo environment in Chromium, Firefox and WebKit.