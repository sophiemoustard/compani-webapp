describe('Customer billing tests', () => {
  beforeEach(() => {
    cy.request(`${Cypress.env('API_HOSTNAME')}/end-to-end/seed`);
    cy.login({ email: 'helper@alenvi.io', password: '123456!eR' });
    cy.visit('/customers/documents');
  });

  it('should display correctly customer billing page', function () {
    cy.get('[data-cy=customer-identity]').should('contain', 'Romain BARDET');
    cy.get('[data-cy=date-range] .q-field__native').should('have.length', 2).and(($inputs) => {
      expect($inputs.eq(0).val()).to.equal(Cypress.moment().subtract(2, 'M').startOf('M').format('DD/MM/YYYY'));
      expect($inputs.eq(1).val()).to.equal(Cypress.moment().format('DD/MM/YYYY'));
    });
    cy.get('[data-cy=start-period-customer] td').should('have.length', 5).and(($tds) => {
      expect($tds.eq(0)).to.have.text(Cypress.moment().subtract(2, 'M').startOf('M').format('DD/MM/YY'));
      expect($tds.eq(1)).to.have.text('Début de période');
      expect($tds.eq(2)).to.not.have.text();
      expect($tds.eq(3)).to.have.text('0,00\u00A0€');
      expect($tds.eq(4)).to.not.have.text();
    });
  });
});
