import { CLIENT_ADMIN, COACH, AUXILIARY, PLANNING_REFERENT } from '../../../../../src/core/data/constants';
import { goToDisplayedEvents } from '../../utils';

describe('Auxiliary planning - display', () => {
  beforeEach(() => {
    cy.request(`${Cypress.env('API_HOSTNAME')}/end-to-end/seed/planning`);
    cy.login({ email: 'auxiliary@alenvi.io', password: '123456!eR' });
    cy.visit('/ni/planning/auxiliaries');
  });

  it('should display correctly auxiliary planning', () => {
    cy.get('#q-app').click(500, 500);
    goToDisplayedEvents();

    cy.dataCy('planning-search').eq(1).click();
    cy.dataCy('planning-search').eq(1).type('{backspace}Auxiliary TEST{downarrow}{enter}');
    cy.dataCy('planning-row').should('have.length', 1);
    cy.dataCy('planning-event').should('have.length', 1);
    cy.dataCy('event-title').should('have.length', 1);

    cy.dataCy('event-title').eq(0).should('contain', 'R. BARDET');
    cy.dataCy('event-hours').eq(0).should('contain', '10:00 - 12:30');

    cy.dataCy('planning-before').click();
    cy.dataCy('week-number').should('contain', 9);
    cy.get('.event-intervention').should('have.length', 2);
    cy.dataCy('event-title').eq(0).should('contain', 'R. BARDET');
    cy.dataCy('event-hours').eq(0).should('contain', '11:15 - 12:30');
    cy.dataCy('event-title').eq(1).should('contain', 'R. BARDET');
    cy.dataCy('event-hours').eq(1).should('contain', '18:15 - 20:30');

    cy.dataCy('planning-search').eq(1).click();
    cy.dataCy('planning-search').eq(1).type('Customer referent{downarrow}{enter}');
    cy.dataCy('planning-row').should('have.length', 2);
  });
});

const loggedUsers = [
  { login: 'planning-referent@alenvi.io', password: '123456!eR', role: PLANNING_REFERENT },
  { login: 'auxiliary@alenvi.io', password: '123456!eR', role: AUXILIARY },
  { login: 'client-admin@alenvi.io', password: '123456!eR', role: CLIENT_ADMIN },
  { login: 'coach@alenvi.io', password: '123456!eR', role: COACH },
];

loggedUsers.forEach((user) => {
  describe(`Auxiliary planning - actions - ${user.role}`, () => {
    beforeEach(() => {
      cy.request(`${Cypress.env('API_HOSTNAME')}/end-to-end/seed/planning`);
      cy.login({ email: user.login, password: user.password });
      cy.visit('/ni/planning/auxiliaries');
    });

    it('should create event', () => {
      cy.get('#q-app').click(500, 500);
      goToDisplayedEvents();

      cy.dataCy('planning-search').eq(1).click();
      cy.dataCy('planning-search').eq(1).type('{backspace}Auxiliary TEST{downarrow}{enter}');
      cy.dataCy('planning-event').should('have.length', 1);

      cy.dataCy('planning-cell').eq(4).click('bottom');
      cy.dataCy('event-creation-customer').eq(0).type('Romain{downarrow}{enter}');
      cy.dataCy('event-creation-button').click();
      cy.dataCy('planning-event').should('have.length', 2);
    });

    it('should update event', () => {
      cy.get('#q-app').click(500, 500);
      goToDisplayedEvents();

      cy.dataCy('planning-search').eq(1).click();
      cy.dataCy('planning-search').eq(1).type('{backspace}Auxiliary TEST{downarrow}{enter}');
      cy.dataCy('planning-event').should('have.length', 1);
      cy.dataCy('planning-event').click();

      cy.dataCy('time-input').eq(0).clear().type('15:00');
      cy.dataCy('time-input').eq(1).clear().type('17:15');
      cy.dataCy('event-edition-button').click();

      cy.dataCy('event-hours').eq(0).should('contain', '15:00 - 17:15');
    });

    it('should delete event', () => {
      cy.get('#q-app').click(500, 500);
      goToDisplayedEvents();

      cy.dataCy('planning-search').eq(1).click();
      cy.dataCy('planning-search').eq(1).type('{backspace}Auxiliary TEST{downarrow}{enter}');
      cy.dataCy('planning-event').should('have.length', 1);

      cy.dataCy('planning-event').click();
      cy.dataCy('event-deletion-button').click();
      cy.get('.q-dialog-plugin > .q-card__actions > .q-btn').eq(1).click();

      cy.dataCy('planning-event').should('have.length', 0);
    });
  });
});
