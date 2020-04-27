describe('Customer agenda tests', () => {
  beforeEach(() => {
    cy.request(`${Cypress.env('API_HOSTNAME')}/end-to-end/seed`);
    cy.login({ email: 'helper@alenvi.io', password: '123456!eR' });
  });

  it('test cookies', function () {
    cy.visit('/customers/agenda');
  });
});
