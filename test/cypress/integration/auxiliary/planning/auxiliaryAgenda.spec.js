const { PLANNING } = require('../../../../../src/core/data/constants');

describe('Auxiliary agenda - display', () => {
  beforeEach(() => {
    cy.initiateTest({ seedType: PLANNING, credentials: { email: 'auxiliary@alenvi.io', password: '123456!eR' } });
    cy.visit('/auxiliaries/agenda');
  });

  it('should display correctly auxiliary agenda', () => {
    cy.get('#q-app').click(500, 500);
    cy.get('[data-cy=agenda-search]').eq(1).click();
    cy.get('[data-cy=agenda-event]').should('have.length', 1);
    cy.get('[data-cy=event-title]').should('have.length', 1);

    cy.get('[data-cy=event-title]').eq(0).should('contain', 'R.BARDET');
    cy.get('[data-cy=event-start-hour]').eq(0).should('contain', '10:00');
    cy.get('[data-cy=event-end-hour]').eq(0).should('contain', '12:30');

    cy.get('[data-cy=planning_before]').click();
    cy.get('[data-cy=week-number]').should('contain', Cypress.luxon.DateTime.now().minus({ weeks: 1 }).weekNumber);
    cy.get('.event-intervention').should('have.length', 2);
    cy.get('[data-cy=event-title]').eq(0).should('contain', 'R.BARDET');
    cy.get('[data-cy=event-start-hour]').eq(0).should('contain', '11:15');
    cy.get('[data-cy=event-end-hour]').eq(0).should('contain', '12:30');
    cy.get('[data-cy=event-title]').eq(1).should('contain', 'R.BARDET');
    cy.get('[data-cy=event-start-hour]').eq(1).should('contain', '18:15');
    cy.get('[data-cy=event-end-hour]').eq(1).should('contain', '20:30');

    cy.get('[data-cy=agenda-search]').eq(1).click();
    cy.get('[data-cy=agenda-search]').eq(1).type('Customer referent{downarrow}{enter}');
    cy.get('[data-cy=agenda-event]').should('have.length', 1);
  });

  it('should create event', () => {
    cy.get('#q-app').click(500, 500);
    cy.get('[data-cy=agenda-cell]').eq(1).click();
    cy.get('[data-cy=event-creation-customer]').eq(0).type('Romain{downarrow}{enter}');
    cy.get('[data-cy=event-creation-button]').click();

    cy.get('[data-cy=agenda-event]').should('have.length', 2);
  });

  it('should update event', () => {
    cy.get('#q-app').click(500, 500);
    cy.get('[data-cy=agenda-event]').click();
    cy.get('[data-cy=time-input]').eq(0).clear().type('15:00');
    cy.get('[data-cy=time-input]').eq(1).clear().type('17:15');
    cy.get('[data-cy=event-edition-button]').click();

    cy.get('[data-cy=event-start-hour]').eq(0).should('contain', '15:00');
    cy.get('[data-cy=event-end-hour]').eq(0).should('contain', '17:15');
  });

  it('should delete event', () => {
    cy.get('#q-app').click(500, 500);
    cy.get('[data-cy=agenda-event]').click();
    cy.get('[data-cy=event-deletion-button]').click();
    cy.get('.q-dialog-plugin > .q-card__actions > .q-btn').eq(1).click();

    cy.get('[data-cy=agenda-event]').should('have.length', 0);
  });
});
