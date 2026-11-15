const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/loginPage');
const { PIMPage } = require('../pages/PIMPage');
const { username, password } = require('../config/environments');

test('TC_001 - Verify valid login', async ({ page }) => {

  const loginPage = new LoginPage(page);

  await loginPage.openLoginPage();

  await loginPage.login(username, password);

  await expect(page).toHaveURL(/dashboard/);

});

test('TC_002 - Verify invalid login', async ({ page }) => {

  const loginPage = new LoginPage(page);

  await loginPage.openLoginPage();

  await loginPage.login('WrongUser', 'WrongPassword');

  await expect(page.getByText('Invalid credentials', { exact: true })).toBeVisible();

  await expect(page).toHaveURL(/auth\/login/);

  // Open dashboard without login
  await page.goto('/web/index.php/dashboard/index');
  await expect(page).toHaveURL(/auth\/login/);

});

test('TC_003 - Verify employee management navigation', async ({ page }) => {

  const loginPage = new LoginPage(page);

  await loginPage.openLoginPage();

  await loginPage.login(username, password);

  await expect(page).toHaveURL(/dashboard/);

  const pimPage = new PIMPage(page);
  await pimPage.open();

  await expect(page).toHaveURL(/viewEmployeeList/);

  await expect(page.getByRole('heading', { name: 'PIM' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Employee Information' })).toBeVisible();
  await expect(pimPage.searchButton).toBeVisible();

});

test('TC_004 - Verify employee data', async ({ page }) => {

  const loginPage = new LoginPage(page);

  await loginPage.openLoginPage();
  await loginPage.login(username, password);

  // Wait for employee list API
  const responsePromise = page.waitForResponse((response) =>
    response.url().includes('/api/v2/pim/employees') && response.url().includes('model=detailed')
  );

  const pimPage = new PIMPage(page);
  await pimPage.open();

  const response = await responsePromise;
  expect(response.status()).toBe(200);

  const body = await response.json();
  const employee = body.data[0];

  await expect(page.getByRole('heading', { name: 'Employee Information' })).toBeVisible();
  await expect(pimPage.table).toBeVisible();
  await expect(page.getByText('First (& Middle) Name')).toBeVisible();

  // First employee row
  const firstRow = pimPage.table.getByRole('row').nth(1);
  const cells = firstRow.getByRole('cell');

  // Compare table with API data
  await expect(cells.nth(1)).toHaveText(employee.employeeId);
  await expect(cells.nth(2)).toContainText(employee.firstName);
  await expect(cells.nth(3)).toHaveText(employee.lastName);

  await expect(page.getByText(`(${body.meta.total}) Records Found`)).toBeVisible();

});

test('TC_005 - Verify logout functionality', async ({ page }) => {

  const loginPage = new LoginPage(page);

  await loginPage.openLoginPage();

  await loginPage.login(username, password);

  await expect(page).toHaveURL(/dashboard/);

  // Open profile menu
  await page.getByRole('banner').getByRole('img', { name: 'profile picture' }).click();

  await page.getByRole('menuitem', { name: 'Logout' }).click();

  await expect(page).toHaveURL(/auth\/login/);

  // Open PIM after logout
  await page.goto('/web/index.php/pim/viewEmployeeList');
  await expect(page).toHaveURL(/auth\/login/);

});
