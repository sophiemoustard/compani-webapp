describe('Login page tests', () => {
  beforeEach(() => {
    cy.request(`${Cypress.env('API_HOSTNAME')}/end-to-end/seed`);
    cy.visit('/login');
  });

  it('should display an error if credentials are wrong', () => {
    cy.get('[data-cy=email]').type('admin@alenvi.io');
    cy.get('[data-cy=password]').type('3236{enter}');
    cy.get('.q-notification__message')
      .should('be.visible')
      .and('contain', 'Impossible de se connecter');
    cy.url().should('include', '/login');
  })

  it('should visits login page and connects admin user', () => {
    cy.get('[data-cy=email]').type('admin@alenvi.io');
    cy.get('[data-cy=password]').type('123456');
    cy.get('[data-cy=login]').click();
    cy.url().should('include', '/ni/auxiliaries');
    cy.getCookie('alenvi_token').should('exist');
    cy.getCookie('alenvi_token_expires_in').should('exist');
    cy.getCookie('refresh_token').should('exist');
    cy.getCookie('user_id').should('exist');
  });
});
