describe('Login page tests', () => {
  beforeEach(() => {
    cy.request(`${Cypress.env('API_HOSTNAME')}/end-to-end/seed/authentication`);
    cy.visit('/login');
  });

  it('should display an error if credentials are wrong', () => {
    cy.get('[data-cy=email]').type('client-admin@alenvi.io');
    cy.get('[data-cy=password]').type('3236{enter}');
    cy.get('.q-notification__message')
      .scrollIntoView()
      .should('be.visible')
      .and('contain', 'Identifiant ou mot de passe invalide');
    cy.url().should('include', '/login');
  });

  const paramsArray = [
    { person: 'client admin', email: 'client-admin@alenvi.io', password: '123456!eR', url: 'ni/auxiliaries' },
    { person: 'coach', email: 'coach@alenvi.io', password: '123456!eR', url: 'ni/auxiliaries' },
    { person: 'auxiliary', email: 'auxiliary@alenvi.io', password: '123456!eR', url: 'auxiliaries/agenda' },
    {
      person: 'auxiliary without company',
      email: 'auxiliary-without-company@alenvi.io',
      password: '123456!eR',
      url: 'account',
    },
    {
      person: 'planning referent',
      email: 'planning-referent@alenvi.io',
      password: '123456!eR',
      url: 'auxiliaries/agenda',
    },
    { person: 'helper', email: 'helper@alenvi.io', password: '123456!eR', url: 'customers/agenda' },
    {
      person: 'vendor admin',
      email: 'vendor-admin@alenvi.io',
      password: '123456!eR',
      url: 'ad/ni/management/blended-courses',
    },
    {
      person: 'training organisation manager',
      email: 'training-organisation-manager@alenvi.io',
      password: '123456!eR',
      url: 'ad/ni/management/blended-courses',
    },
    { person: 'trainer', email: 'trainer@alenvi.io', password: '123456!eR', url: 'ad/trainers/management/courses' },
  ];

  paramsArray.forEach((params) => {
    it(`should visits login page and connects ${params.person} user`, () => {
      cy.get('[data-cy=email]').type(params.email);
      cy.get('[data-cy=password]').type(params.password);
      cy.get('[data-cy=login]').click();

      cy.url().should('include', params.url);
      cy.getCookie('alenvi_token').should('exist');
      cy.getCookie('refresh_token').should('exist');
    });
  });
});
