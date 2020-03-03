describe('Login page tests', () => {
  beforeEach(() => {
    cy.visit('/login');
  })

  it('should visits login page and connects admin user', () => {
    cy.get('[data-cy=email]').type('');
    cy.get('[data-cy=password]').type('');
  });
});
