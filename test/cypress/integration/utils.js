export const goToDisplayedEvents = () => {
  cy.dataCy('planning-date').click();
  cy.get('.q-date__navigation > .relative-position').eq(0).click();
  cy.get('.q-date__months-item').eq(2).click();
  cy.get('.q-date__navigation > .relative-position').eq(1).click();
  cy.get('.q-date__years-item').eq(0).click();
  cy.get('.q-date__calendar-item--in').eq(1).click();
};
