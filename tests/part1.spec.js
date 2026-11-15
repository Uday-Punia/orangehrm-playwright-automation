const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/loginPage');
const { username, password } = require('../config/environments');

test('TC_001 - Verify valid login', async ({ page }) => {

  // Create LoginPage object
  const loginPage = new LoginPage(page);

  // Open OrangeHRM
  await loginPage.openLoginPage();

  // Enter valid credentials
  await loginPage.login(username, password);

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

  // Open dashboard without login
  await page.goto('/web/index.php/dashboard/index');
  await expect(page).toHaveURL(/auth\/login/);

});

test('TC_003 - Verify employee management navigation', async ({ page }) => {

  // Create LoginPage object
  const loginPage = new LoginPage(page);

  // Open OrangeHRM
  await loginPage.openLoginPage();

  // Login with valid credentials
  await loginPage.login(username, password);

  // Verify dashboard opens
  await expect(page).toHaveURL(/dashboard/);

  // Navigate to PIM module
  await page.getByRole('link', { name: 'PIM' }).click();

  // Verify Employee List page opens
  await expect(page).toHaveURL(/viewEmployeeList/);

  // Verify page content
  await expect(page.getByRole('heading', { name: 'PIM' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Employee Information' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();

});

test('TC_004 - Verify employee data', async ({ page }) => {

  const loginPage = new LoginPage(page);

  await loginPage.openLoginPage();
  await loginPage.login(username, password);

  // Wait for employee list API
  const responsePromise = page.waitForResponse((response) =>
    response.url().includes('/api/v2/pim/employees') && response.url().includes('model=detailed')
  );

  await page.getByRole('link', { name: 'PIM' }).click();

  const response = await responsePromise;
  expect(response.status()).toBe(200);

  const body = await response.json();
  const employee = body.data[0];

  await expect(page.getByRole('heading', { name: 'Employee Information' })).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByText('First (& Middle) Name')).toBeVisible();

  // First employee row
  const firstRow = page.getByRole('table').getByRole('row').nth(1);
  const cells = firstRow.getByRole('cell');

  // Compare table with API data
  await expect(cells.nth(1)).toHaveText(employee.employeeId);
  await expect(cells.nth(2)).toContainText(employee.firstName);
  await expect(cells.nth(3)).toHaveText(employee.lastName);

  // Verify record count
  await expect(page.getByText(`(${body.meta.total}) Records Found`)).toBeVisible();

});

test('TC_005 - Verify logout functionality', async ({ page }) => {

  const loginPage = new LoginPage(page);

  // Open OrangeHRM
  await loginPage.openLoginPage();

  // Login with valid credentials
  await loginPage.login(username, password);

  // Verify dashboard
  await expect(page).toHaveURL(/dashboard/);

  // Open profile menu
  await page.getByRole('banner').getByRole('img', { name: 'profile picture' }).click();

  // Click Logout
  await page.getByRole('menuitem', { name: 'Logout' }).click();

  // Verify user returns to login page
  await expect(page).toHaveURL(/auth\/login/);

  // Open PIM after logout
  await page.goto('/web/index.php/pim/viewEmployeeList');
  await expect(page).toHaveURL(/auth\/login/);

});
