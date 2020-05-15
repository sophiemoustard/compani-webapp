describe('Customer contact tests', () => {
  beforeEach(() => {
    cy.request(`${Cypress.env('API_HOSTNAME')}/end-to-end/seed/planning`);
    cy.login({ email: 'helper@alenvi.io', password: '123456!eR' });
    cy.visit('/customers/contact');
  });

  it('should display correctly customer contact page', () => {
    cy.get('[data-cy=referent-identity]').should('contain', 'Referent TEST');
    cy.get('[data-cy=referent-phone]').should('contain', '0987654321');
    cy.get('[data-cy=billing-asssistance-email]').should('contain', 'assistance@billing.eu');
  });
});
