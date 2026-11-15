const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/loginPage');

test('TC_001 - Verify valid login', async ({ page }) => {

  // Create LoginPage object
  const loginPage = new LoginPage(page);

  // Open OrangeHRM
  await loginPage.openLoginPage();

  // Enter valid credentials
  await loginPage.login('Admin', 'admin123');

  // Verify successful login
  await expect(page).toHaveURL(/dashboard/);

});

test('TC_002 - Verify invalid login', async ({ page }) => {

  // Create LoginPage object
  const loginPage = new LoginPage(page);

  // Open OrangeHRM
  await loginPage.openLoginPage();

  // Enter invalid credentials
  await loginPage.login('WrongUser', 'WrongPassword');

  // Verify exact error message
  await expect(page.getByText('Invalid credentials', { exact: true })).toBeVisible();

  // Verify user remains on login page
  await expect(page).toHaveURL(/auth\/login/);

  // Try to open the dashboard directly without logging in
  await page.goto('/web/index.php/dashboard/index');

  // Verify user is sent back to login page
  await expect(page).toHaveURL(/auth\/login/);

});

test('TC_003 - Verify employee management navigation', async ({ page }) => {

  // Create LoginPage object
  const loginPage = new LoginPage(page);

  // Open OrangeHRM
  await loginPage.openLoginPage();

  // Login with valid credentials
  await loginPage.login('Admin', 'admin123');

  // Verify dashboard opens
  await expect(page).toHaveURL(/dashboard/);

  // Navigate to PIM module
  await page.getByRole('link', { name: 'PIM' }).click();

  // Verify Employee List page opens
  await expect(page).toHaveURL(/viewEmployeeList/);

  // Verify page content is rendered
  await expect(page.getByRole('heading', { name: 'PIM' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Employee Information' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();

});

test('TC_004 - Verify employee data', async ({ page }) => {

  const loginPage = new LoginPage(page);

  await loginPage.openLoginPage();
  await loginPage.login('Admin', 'admin123');

  // Wait for the API call that loads the employee table
  const responsePromise = page.waitForResponse((response) =>
    response.url().includes('/api/v2/pim/employees') && response.url().includes('model=detailed')
  );

  await page.getByRole('link', { name: 'PIM' }).click();

  const response = await responsePromise;
  expect(response.status()).toBe(200);

  // Employee data sent by the server
  const body = await response.json();
  const employee = body.data[0];

  await expect(page.getByRole('heading', { name: 'Employee Information' })).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByText('First (& Middle) Name')).toBeVisible();

  // First row of the table (row 0 is the header row)
  const firstRow = page.getByRole('table').getByRole('row').nth(1);
  const cells = firstRow.getByRole('cell');

  // Verify the table shows the same employee as the server sent
  await expect(cells.nth(1)).toHaveText(employee.employeeId);
  await expect(cells.nth(2)).toContainText(employee.firstName);
  await expect(cells.nth(3)).toHaveText(employee.lastName);

  // Verify record count matches the total from the server
  await expect(page.getByText(`(${body.meta.total}) Records Found`)).toBeVisible();

});

test('TC_005 - Verify logout functionality', async ({ page }) => {

  const loginPage = new LoginPage(page);

  // Open OrangeHRM
  await loginPage.openLoginPage();

  // Login with valid credentials
  await loginPage.login('Admin', 'admin123');

  // Verify dashboard
  await expect(page).toHaveURL(/dashboard/);

  // Click user profile dropdown
  await page.getByRole('banner').getByRole('img', { name: 'profile picture' }).click();

  // Click Logout
  await page.getByRole('menuitem', { name: 'Logout' }).click();

  // Verify user returns to login page
  await expect(page).toHaveURL(/auth\/login/);

  // Verify PIM page cannot be opened after logout
  await page.goto('/web/index.php/pim/viewEmployeeList');
  await expect(page).toHaveURL(/auth\/login/);

});
