const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/loginPage');
const { username, password } = require('../config/environments');

test.beforeEach(async ({ page }) => {

  // Login to OrangeHRM
  const loginPage = new LoginPage(page);

  await loginPage.openLoginPage();
  await loginPage.login(username, password);

  // Navigate to PIM
  await page.getByRole('link', { name: 'PIM' }).click();

});

test('EC_001 - Search nonexistent employee', async ({ page }) => {

  // Enter nonexistent employee name
  await page.getByPlaceholder('Type for hints...').first().fill('XYZ98765');

  // Click Search
  await page.getByRole('button', { name: 'Search' }).click();

  // Verify No Records Found in employee table
  await expect(page.locator('span.oxd-text--span').getByText('No Records Found')).toBeVisible();

});

test('EC_002 - Search with special characters', async ({ page }) => {

  // Enter special characters in Employee Name
  await page.getByPlaceholder('Type for hints...').first().fill('@#$%');

  // Click Search
  await page.getByRole('button', { name: 'Search' }).click();

  // Verify No Records Found message
  await expect(page.locator('span.oxd-text--span').getByText('No Records Found')).toBeVisible();

  // Verify Employee Information section
  await expect(page.getByRole('heading', { name: 'Employee Information' })).toBeVisible();

  // Verify employee table is displayed
  await expect(page.getByRole('table')).toBeVisible();

});

test('EC_003 - Search name with spaces before and after', async ({ page }) => {

  // Get first name of first employee
  const firstRow = page.getByRole('table').getByRole('row').nth(1);
  const fullName = await firstRow.getByRole('cell').nth(2).innerText();
  const firstName = fullName.split(' ')[0];

  // Enter name with spaces
  await page.getByPlaceholder('Type for hints...').first().fill('  ' + firstName + '  ');

  // Suggestion shows the employee
  await expect(page.getByRole('listbox')).toContainText(firstName);

  // Click Search
  await page.getByRole('button', { name: 'Search' }).click();

  // Bug - employee not found
  await expect(page.locator('span.oxd-text--span').getByText('No Records Found')).toBeVisible();

});

test('EC_004 - Search Employee Id longer than allowed', async ({ page }) => {

  // Wait for employee list
  await expect(page.locator('span.oxd-text--span').getByText(/Records Found/)).toBeVisible();

  // Enter 11 digit Employee Id
  await page.locator('.oxd-input-group').filter({ hasText: 'Employee Id' }).getByRole('textbox').fill('12345678901');

  // Click Search
  await page.getByRole('button', { name: 'Search' }).click();

  // Verify error message and empty table
  await expect(page.getByText('Invalid Parameter')).toBeVisible();
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(1);

  // Bug - old record count still shown
  await expect(page.locator('span.oxd-text--span').getByText(/\(\d+\) Records Found/)).toBeVisible();

});
