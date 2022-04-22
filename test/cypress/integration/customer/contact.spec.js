const { PLANNING } = require('../../../../src/core/data/constants');

describe('Customer contact tests', () => {
  beforeEach(() => {
    cy.initiateTest({ seedType: PLANNING, credentials: { email: 'helper@alenvi.io', password: '123456!eR' } });
    cy.visit('/customers/contact');
  });

  it('should display correctly customer contact page', () => {
    cy.get('#q-app').click(500, 500);
    cy.dataCy('referent-identity').should('contain', 'Customer referent');
    cy.dataCy('referent-phone').should('contain', '0987654321');
    cy.dataCy('billing-asssistance-email').should('contain', 'assistance@billing.eu');
  });
});
