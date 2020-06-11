describe('Auxiliary planning', () => {
  beforeEach(() => {
    cy.request(`${Cypress.env('API_HOSTNAME')}/end-to-end/seed/planning`);
    cy.login({ email: 'auxiliary@alenvi.io', password: '123456!eR' });
    cy.visit('/ni/planning/auxiliaries').as('page');
  });

  it('should display correctly auxiliary planning', () => {
    cy.get('#q-app').click(500, 500);
    cy.get('[data-cy=planning-search]').eq(1).click();
    cy.get('[data-cy=planning-search]').eq(1).type('Customer referent 1{downarrow}{enter}');
    cy.get('[data-cy=planning-row]').should('have.length', 1);
    cy.get('[data-cy=planning-event]').should('have.length', 1);
    cy.get('[data-cy=event-title]').should('have.length', 1);

    cy.get('[data-cy=event-title]').eq(0).should('contain', 'R. BARDET');
    cy.get('[data-cy=event-hours]').eq(0).should('contain', '10:00 - 12:30');

    cy.get('[data-cy=planning_before]').click();
    cy.get('[data-cy=week-number]').should('contain', Cypress.moment().subtract(1, 'week').subtract(1, 'day').week());
    cy.get('.event-intervention').should('have.length', 2);
    cy.get('[data-cy=event-title]').eq(0).should('contain', 'R. BARDET');
    cy.get('[data-cy=event-hours]').eq(0).should('contain', '11:15 - 12:30');
    cy.get('[data-cy=event-title]').eq(1).should('contain', 'R. BARDET');
    cy.get('[data-cy=event-hours]').eq(1).should('contain', '18:15 - 20:30');

    cy.get('[data-cy=planning-search]').eq(1).click();
    cy.get('[data-cy=planning-search]').eq(1).type('Customer referent 2{downarrow}{enter}');
    cy.get('[data-cy=planning-row]').should('have.length', 2);
  });
});
