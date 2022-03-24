import './commands';

const luxon = require('luxon');

const resizeObserverLoopErrRe = /^ResizeObserver loop limit exceeded/;

Cypress.on('uncaught:exception', (err) => {
  if (resizeObserverLoopErrRe.test(err.message)) {
    // returning false here prevents Cypress from failing the test
    return false;
  }
});

luxon.Settings.defaultLocale = 'fr';
luxon.Settings.defaultZone = 'Europe/Paris';
luxon.Settings.throwOnInvalid = true;
Cypress.luxon = luxon;
