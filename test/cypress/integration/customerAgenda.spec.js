describe('Customer agenda tests', () => {
  beforeEach(() => {
    cy.request(`${Cypress.env('API_HOSTNAME')}/end-to-end/seed`);
    cy.login({ email: 'helper@alenvi.io', password: '123456!eR' });
    cy.visit('/customers/agenda');
  });

  it('should display correctly the agenda page', function () {
    cy.get('[data-cy=customer-identity]').should('have.value', 'Romain BARDET');

    cy.get('[data-cy=week-number]').should('contain', Cypress.moment().subtract(1, 'day').week());
    cy.get('[data-cy=days-number-0]').should(
      'contain',
      Cypress.moment().subtract(1, 'day').startOf('week').add(1, 'day').format('DD')
    );
    cy.get('[data-cy=days-number-6]').should(
      'contain',
      Cypress.moment().subtract(1, 'day').endOf('week').add(1, 'day').format('DD')
    );
  });

  it('should go through agenda and display events', function () {
    cy.get('#q-app').click(500, 500);
    cy.get('.event-intervention').should('have.length', 1);
    cy.get('[data-cy=event-title-1234567890abcdef12345678]').should('contain', 'Auxiliary T.');
    cy.get('[data-cy=event-hours-1234567890abcdef12345678]').should('contain', '10:00 - 12:30');

    cy.get('[data-cy=planning_before]').click();
    cy.get('[data-cy=week-number]').should('contain', Cypress.moment().subtract(1, 'week').subtract(1, 'day').week());
    cy.get('.event-intervention').should('have.length', 2);
    cy.get('[data-cy=event-title-123456789012345678abcdef]').should('contain', 'Auxiliary T.');
    cy.get('[data-cy=event-hours-123456789012345678abcdef]').should('contain', '18:15 - 20:30');
    cy.get('[data-cy=event-title-abcdef123456789012345678]').should('contain', 'PlanningReferent T.');
    cy.get('[data-cy=event-hours-abcdef123456789012345678]').should('contain', '11:15 - 12:30');

    cy.get('[data-cy=planning_after]').click();
    cy.get('[data-cy=week-number]').should('contain', Cypress.moment().subtract(1, 'day').week());

    cy.get('[data-cy=planning_before]').click();
    cy.get('[data-cy=planning_before]').click();
    cy.get('[data-cy=planning_today]').click();
    cy.get('[data-cy=week-number]').should('contain', Cypress.moment().subtract(1, 'day').week());
  });
});
