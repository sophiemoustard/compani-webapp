// these two commands let you persist local storage between tests
const LOCAL_STORAGE_MEMORY = {}

Cypress.Commands.add('saveLocalStorage', () => {
  Object.keys(localStorage).forEach((key) => {
    LOCAL_STORAGE_MEMORY[key] = localStorage[key]
  })
})

Cypress.Commands.add('restoreLocalStorage', () => {
  Object.keys(LOCAL_STORAGE_MEMORY).forEach((key) => {
    localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key])
  })
})

// CHAINABLE QUASAR INPUT FIELD TYPES
// usage:
//
// cy.get('[data-cy=target-element]').quasar('text', '');
//
// todo: make sure that this is still compliant with 1.0
//
Cypress.Commands.add('testRoute', (route) => {
  cy.location().should((loc) => {
    expect(loc.hash).to.contain(route)
  })
})

Cypress.Commands.add('quasar', { prevSubject: 'element' }, (subject, mode, option) => {
  if (mode === 'select') {
    cy.wrap(subject)
      .invoke('show')
      .click({ force: true })
      .then(() => {
        cy.get('.q-popover').contains(option).click()
      })
  } else if (mode === 'grid') {
    cy.wrap(subject).within(() => {
      cy.get('input').click({ force: true, multiple: true });
    })
  } else if (mode === 'tag-list') {
    Object.keys(option)
      .forEach((x) => {
        cy.wrap(subject)
          .within(() => {
            cy.get('input').first().type(`${option[x]}{enter}`)
          })
      })
  } else {
    cy.wrap(subject)
      .invoke('show')
      .within(($subject) => { // eslint-disable-line
        switch (mode) {
          case 'date':
          case 'text':
          case 'email':
            cy.get('input:first').type(option).should('have.value', option)
            break;
          case 'radio':
          case 'checkbox':
            cy.contains(option).click()
            break
          default:
            break
        }
      })
  }
})

Cypress.Commands.overwrite('log', (subject, message) => cy.task('log', message));
