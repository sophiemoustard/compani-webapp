Cypress.Commands.overwrite('log', (subject, message) => cy.task('log', message));

Cypress.Commands.add('login', (credentials) => {
  cy.request('POST', `${Cypress.env('API_HOSTNAME')}/users/authenticate`, credentials).then((resp) => {
    const { data } = resp.body;
    cy.setCookie('alenvi_token', `${data.token}`);
    cy.setCookie('alenvi_token_expires_in', `${data.expiresIn}`);
    cy.setCookie('refresh_token', `${data.refreshToken}`);
    cy.setCookie('user_id', `${data.user._id}`);
  });
});
