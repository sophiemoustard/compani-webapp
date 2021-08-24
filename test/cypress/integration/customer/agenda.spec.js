import { goToDisplayedEvents } from '../utils';

describe('customers agenda tests', () => {
  beforeEach(() => {
    cy.request(`${Cypress.env('API_HOSTNAME')}/end-to-end/seed/planning`);
    cy.login({ email: 'helper@alenvi.io', password: '123456!eR' });
    cy.visit('/customers/agenda');
  });

  it('should display correctly the agenda page', () => {
    cy.get('#q-app').click(500, 500);
    cy.get('[data-cy=customer-identity]').should('have.value', 'Romain BARDET');

    goToDisplayedEvents();

    cy.get('[data-cy=week-number]').should('contain', 15);
    cy.get('[data-cy=days-number]').eq(0).should('contain', '06');
    cy.get('[data-cy=days-number]').eq(6).should('contain', '12');
  });

  it('should go through agenda and display events', () => {
    cy.get('#q-app').click(500, 500);
    goToDisplayedEvents();

    cy.get('.event-intervention').should('have.length', 1);
    cy.get('[data-cy=event-title]').eq(0).should('contain', 'Auxiliary T.');
    cy.get('[data-cy=event-hours]').eq(0).should('contain', '10:00 - 12:30');

    cy.get('[data-cy=planning-before]').click();
    cy.get('[data-cy=week-number]').should('contain', 9);
    cy.get('.event-intervention').should('have.length', 3);
    cy.get('[data-cy=event-title]').eq(0).should('contain', 'Auxiliary T.');
    cy.get('[data-cy=event-hours]').eq(0).should('contain', '11:15 - 12:30');
    cy.get('[data-cy=event-title]').eq(1).should('contain', 'Customer referent T.');
    cy.get('[data-cy=event-hours]').eq(1).should('contain', '13:15 - 14:30');
    cy.get('[data-cy=event-title]').eq(2).should('contain', 'Auxiliary T.');
    cy.get('[data-cy=event-hours]').eq(2).should('contain', '18:15 - 20:30');

    cy.get('[data-cy=planning-after]').click();
    cy.get('[data-cy=week-number]').should('contain', 10);
  });
});
