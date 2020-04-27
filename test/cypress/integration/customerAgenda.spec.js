describe('Customer agenda tests', () => {
  beforeEach(() => {
    cy.request(`${Cypress.env('API_HOSTNAME')}/end-to-end/seed`);
    cy.login({ email: 'helper@alenvi.io', password: '123456!eR' });
    cy.visit('/customers/agenda');
  });

  it('should display correctly the agenda page', function () {
    cy.get('[data-cy=customer-identity]').should('have.value', 'Romain BARDET');

    cy.get('[data-cy=days-number-0]').should('contain', Cypress.moment().startOf('week').add(1, 'day').format('DD'));
    cy.get('[data-cy=days-number-6]').should('contain', Cypress.moment().endOf('week').add(1, 'day').format('DD'));
  });
});
