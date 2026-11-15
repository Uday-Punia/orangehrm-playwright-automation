const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/loginPage');
const { PIMPage } = require('../pages/PIMPage');
const { username, password } = require('../config/environments');

let pimPage;

test.beforeEach(async ({ page }) => {

  // Login to OrangeHRM
  const loginPage = new LoginPage(page);

  await loginPage.openLoginPage();
  await loginPage.login(username, password);

  // Navigate to PIM
  pimPage = new PIMPage(page);
  await pimPage.open();

});

test('EC_001 - Search nonexistent employee', async () => {

  await pimPage.searchByName('XYZ98765');

  await expect(pimPage.noRecordsFound).toBeVisible();

});

test('EC_002 - Search with special characters', async ({ page }) => {

  await pimPage.searchByName('@#$%');

  await expect(pimPage.noRecordsFound).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Employee Information' })).toBeVisible();
  await expect(pimPage.table).toBeVisible();

});

test('EC_003 - Search name with spaces before and after', async ({ page }) => {

  // Get first name of first employee
  const firstRow = pimPage.table.getByRole('row').nth(1);
  const fullName = await firstRow.getByRole('cell').nth(2).innerText();
  const firstName = fullName.split(' ')[0];

  // Enter name with spaces
  await pimPage.employeeNameInput.fill('  ' + firstName + '  ');

  // Suggestion shows the employee
  await expect(page.getByRole('listbox')).toContainText(firstName);

  await pimPage.searchButton.click();

  // Bug - employee not found
  await expect(pimPage.noRecordsFound).toBeVisible();

});

test('EC_004 - Search Employee Id longer than allowed', async ({ page }) => {

  // Wait for employee list
  await expect(page.locator('span.oxd-text--span').getByText(/Records Found/)).toBeVisible();

  // 11 digit Employee Id
  await pimPage.searchById('12345678901');

  // Verify error message and empty table
  await expect(page.getByText('Invalid Parameter')).toBeVisible();
  await expect(pimPage.table.getByRole('row')).toHaveCount(1);

  // Bug - old record count still shown
  await expect(page.locator('span.oxd-text--span').getByText(/\(\d+\) Records Found/)).toBeVisible();

});

test('NET_001 - Employee list request fails', async ({ page }) => {

  // Block the employee list request
  await page.route('**/api/v2/pim/employees*', (route) => route.abort());

  await page.reload();

  // Page still works
  await expect(pimPage.noRecordsFound).toBeVisible();
  await expect(pimPage.searchButton).toBeEnabled();

});