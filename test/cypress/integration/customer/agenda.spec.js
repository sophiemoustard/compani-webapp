describe('customers agenda tests', () => {
  beforeEach(() => {
    cy.request(`${Cypress.env('API_HOSTNAME')}/end-to-end/seed/planning`);
    cy.login({ email: 'helper@alenvi.io', password: '123456!eR' });
    cy.visit('/customers/agenda');
  });

  it('should display correctly the agenda page', () => {
    cy.get('#q-app').click(500, 500);
    cy.get('[data-cy=customer-identity]').should('have.value', 'Romain BARDET');

    cy.get('[data-cy=week-number]').should('contain', Cypress.moment().subtract(1, 'day').week());
    cy.get('[data-cy=days-number]').eq(0).should(
      'contain',
      Cypress.moment().subtract(1, 'day').startOf('week').add(1, 'day')
        .format('DD')
    );
    cy.get('[data-cy=days-number]').eq(6).should(
      'contain',
      Cypress.moment().subtract(1, 'day').endOf('week').add(1, 'day')
        .format('DD')
    );
  });

  it('should go through agenda and display events', () => {
    cy.get('#q-app').click(500, 500);
    cy.get('.event-intervention').should('have.length', 1);
    cy.get('[data-cy=event-title]').eq(0).should('contain', 'Auxiliary O.');
    cy.get('[data-cy=event-start-hour]').eq(0).should('contain', '10:00');
    cy.get('[data-cy=event-end-hour]').eq(0).should('contain', '12:30');

    cy.get('[data-cy=planning_before]').click();
    cy.get('[data-cy=week-number]').should('contain', Cypress.moment().subtract(1, 'week').subtract(1, 'day').week());
    cy.get('.event-intervention').should('have.length', 3);
    cy.get('[data-cy=event-title]').eq(0).should('contain', 'Auxiliary O.');
    cy.get('[data-cy=event-start-hour]').eq(0).should('contain', '11:15');
    cy.get('[data-cy=event-end-hour]').eq(0).should('contain', '12:30');
    cy.get('[data-cy=event-title]').eq(1).should('contain', 'Customer referent T.');
    cy.get('[data-cy=event-start-hour]').eq(1).should('contain', '13:15');
    cy.get('[data-cy=event-end-hour]').eq(1).should('contain', '14:30');
    cy.get('[data-cy=event-title]').eq(2).should('contain', 'Auxiliary O.');
    cy.get('[data-cy=event-start-hour]').eq(2).should('contain', '18:15');
    cy.get('[data-cy=event-end-hour]').eq(2).should('contain', '20:30');

    cy.get('[data-cy=planning_after]').click();
    cy.get('[data-cy=week-number]').should('contain', Cypress.moment().subtract(1, 'day').week());

    cy.get('[data-cy=planning_before]').click();
    cy.get('[data-cy=planning_before]').click();
    cy.get('[data-cy=planning_today]').click();
    cy.get('[data-cy=week-number]').should('contain', Cypress.moment().subtract(1, 'day').week());
  });
});
