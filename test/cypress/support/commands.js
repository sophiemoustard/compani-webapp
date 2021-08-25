Cypress.Commands.overwrite('log', (subject, message) => cy.task('log', message));

Cypress.Commands.add('dataCy', value => cy.get(`[data-cy=${value}]`));
Cypress.Commands.add('login', (credentials) => {
  cy.request('POST', `${Cypress.env('API_HOSTNAME')}/users/authenticate`, credentials).then((resp) => {
    const { data } = resp.body;
    cy.setCookie('alenvi_token', `${data.token}`);
    cy.setCookie('refresh_token', `${data.refreshToken}`);
    cy.setCookie('user_id', `${data.user._id}`);
  });
});
