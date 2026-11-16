class PIMPage {

  constructor(page) {
    this.page = page;
    this.pimLink = page.getByRole('link', { name: 'PIM' });
    this.employeeNameInput = page.getByPlaceholder('Type for hints...').first();
    this.employeeIdInput = page.locator('.oxd-input-group').filter({ hasText: 'Employee Id' }).getByRole('textbox');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.table = page.getByRole('table');
    this.noRecordsFound = page.locator('span.oxd-text--span').getByText('No Records Found');
  }

  async open() {
    await this.pimLink.click();
    // Wait for the employee list to load before searching
    await this.page.locator('span.oxd-text--span').getByText(/Records? Found/).waitFor();
  }

  async searchByName(name) {
    await this.employeeNameInput.fill(name);
    await this.searchButton.click();
  }

  async searchById(id) {
    await this.employeeIdInput.fill(id);
    await this.searchButton.click();
  }

}

module.exports = { PIMPage };