const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/loginPage');

test.beforeEach(async ({ page }) => {

  // Login to OrangeHRM
  const loginPage = new LoginPage(page);

  await loginPage.openLoginPage();
  await loginPage.login('Admin', 'admin123');

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

  // Take the first employee from the table (the demo data changes, so no fixed name is used)
  const firstRow = page.getByRole('table').getByRole('row').nth(1);
  const fullName = await firstRow.getByRole('cell').nth(2).innerText();
  const firstName = fullName.split(' ')[0];

  // Type the name with spaces before and after, do not select a suggestion
  await page.getByPlaceholder('Type for hints...').first().fill('  ' + firstName + '  ');

  // The suggestion list ignores the spaces and still shows the employee
  await expect(page.getByRole('listbox')).toContainText(firstName);

  // Click Search
  await page.getByRole('button', { name: 'Search' }).click();

  // Bug: Search does not ignore the spaces, so the same employee is not found
  await expect(page.locator('span.oxd-text--span').getByText('No Records Found')).toBeVisible();

});

test('EC_004 - Search Employee Id longer than allowed', async ({ page }) => {

  // Wait until the employee list has loaded
  await expect(page.locator('span.oxd-text--span').getByText(/Records Found/)).toBeVisible();

  // Employee Id can have at most 10 characters, this one has 11
  await page.locator('.oxd-input-group').filter({ hasText: 'Employee Id' }).getByRole('textbox').fill('12345678901');

  // Click Search
  await page.getByRole('button', { name: 'Search' }).click();

  // Error message is shown and the table is emptied (only the header row is left)
  await expect(page.getByText('Invalid Parameter')).toBeVisible();
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(1);

  // Bug: the record count still shows the old number of records
  await expect(page.locator('span.oxd-text--span').getByText(/\(\d+\) Records Found/)).toBeVisible();

});
