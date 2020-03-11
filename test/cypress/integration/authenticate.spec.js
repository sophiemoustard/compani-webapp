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

  it('should visits login page and connects coach user', () => {
    cy.get('[data-cy=email]').type('coach@alenvi.io');
    cy.get('[data-cy=password]').type('123456');
    cy.get('[data-cy=login]').click();
    cy.url().should('include', '/ni/auxiliaries');
    cy.getCookie('alenvi_token').should('exist');
    cy.getCookie('alenvi_token_expires_in').should('exist');
    cy.getCookie('refresh_token').should('exist');
    cy.getCookie('user_id').should('exist');
  });

  it('should visits login page and connects auxiliary user', () => {
    cy.get('[data-cy=email]').type('auxiliary@alenvi.io');
    cy.get('[data-cy=password]').type('123456');
    cy.get('[data-cy=login]').click();
    cy.url().should('include', '/auxiliaries/agenda');
    cy.getCookie('alenvi_token').should('exist');
    cy.getCookie('alenvi_token_expires_in').should('exist');
    cy.getCookie('refresh_token').should('exist');
    cy.getCookie('user_id').should('exist');
  });

  it('should visits login page and connects auxiliarywithoutcompany user', () => {
    cy.get('[data-cy=email]').type('auxiliarywithoutcompany@alenvi.io');
    cy.get('[data-cy=password]').type('123456');
    cy.get('[data-cy=login]').click();
    cy.url().should('include', '/account');
    cy.getCookie('user_id').should('exist');
    cy.getCookie('alenvi_token').should('exist');
    cy.getCookie('alenvi_token_expires_in').should('exist');
    cy.getCookie('refresh_token').should('exist');
  });

  it('should visits login page and connects planning-referent user', () => {
    cy.get('[data-cy=email]').type('planning-referent@alenvi.io');
    cy.get('[data-cy=password]').type('123456');
    cy.get('[data-cy=login]').click();
    cy.url().should('include', '/auxiliaries/agenda');
    cy.getCookie('user_id').should('exist');
    cy.getCookie('alenvi_token').should('exist');
    cy.getCookie('alenvi_token_expires_in').should('exist');
    cy.getCookie('refresh_token').should('exist');
  });

  it('should visits login page and connects helper user', () => {
    cy.get('[data-cy=email]').type('helper@alenvi.io');
    cy.get('[data-cy=password]').type('123456');
    cy.get('[data-cy=login]').click();
    cy.url().should('include', '/customers/agenda');
    cy.getCookie('user_id').should('exist');
    cy.getCookie('alenvi_token').should('exist');
    cy.getCookie('alenvi_token_expires_in').should('exist');
    cy.getCookie('refresh_token').should('exist');
  });
});
