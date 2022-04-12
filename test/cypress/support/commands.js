Cypress.Commands.overwrite('log', (subject, message) => cy.task('log', message));

Cypress.Commands.add('dataCy', value => cy.get(`[data-cy=${value}]`));
Cypress.Commands.add('initiateTest', (credentials) => {
  cy.visit('/');
  cy.task('seedPlanning');
  cy.task('login', credentials).then((data) => {
    cy.setCookie('alenvi_token', `${data.token}`);
    cy.setCookie('refresh_token', `${data.refreshToken}`);
    cy.setCookie('user_id', `${data.user._id}`);
  });
});
