Cypress.Commands.overwrite('log', (subject, message) => cy.task('log', message));

Cypress.Commands.add('dataCy', value => cy.get(`[data-cy=${value}]`));
Cypress.Commands.add('initiateTest', (data) => {
  const { seeds, credentials } = data;
  cy.visit('/');

  switch (seeds) {
    case 'planning':
      cy.task('seedPlanning');
      break;
    case 'billing':
      cy.task('seedBilling');
      break;
    case 'authentication':
      cy.task('seedAuthentication');
      break;
    default:
      throw Error('no seed');
  }

  if (credentials) {
    cy.task('login', credentials).then((resp) => {
      cy.setCookie('alenvi_token', `${resp.token}`);
      cy.setCookie('refresh_token', `${resp.refreshToken}`);
      cy.setCookie('user_id', `${resp.user._id}`);
    });
  }
});
