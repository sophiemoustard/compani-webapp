describe('ToBill', () => {
  beforeEach(() => {
    cy.request(`${Cypress.env('API_HOSTNAME')}/end-to-end/seed/billing`);
    cy.login({ email: 'client-admin@alenvi.io', password: '123456!eR' });
    cy.visit('/ni/billing/to-bill');
    cy.get('#q-app').click(500, 500);
  });

  it('should display, interact and bill correctly', () => {
    // should display correctly to-bill
    cy.get('[data-cy=client-table]').within(() => {
      cy.get('th').should('have.length', 12).and(($th) => {
        expect($th.eq(0)).to.contain('Factu. externe');
        expect($th.eq(1)).to.contain('Bénéficiaire');
        expect($th.eq(2)).to.contain('Client');
        expect($th.eq(3)).to.contain('Début F.');
        expect($th.eq(4)).to.contain('Fin F.');
        expect($th.eq(5)).to.contain('Service');
        expect($th.eq(6)).to.contain('Décompte');
        expect($th.eq(7)).to.contain('PU HT');
        expect($th.eq(8)).to.contain('Remise TTC');
        expect($th.eq(9)).to.contain('HT');
        expect($th.eq(10)).to.contain('TTC');
      });
    });

    cy.get('[data-cy=col-customer]').should('contain', 'ANDTHEQUEENS C.')
    cy.get('[data-cy=col-client]').should('contain', 'ANDTHEQUEENS C.')
    cy.get('[data-cy=col-startDate]').should('contain', '19/01/19')
    cy.get('[data-cy=col-endDate]').should('contain', '15/07/20')
    cy.get('[data-cy=col-service]').should('contain', 'Service 2')
    cy.get('[data-cy=col-hours]').should('contain', '5.00h')
    cy.get('[data-cy=col-unitExclTaxes]').should('contain', '10,71')
    cy.get('[data-cy=col-discount]').should('contain', '0,00')
    cy.get('[data-cy=col-exclTaxes]').should('contain', '53,57')
    cy.get('[data-cy=col-inclTaxes]').should('contain', '60,00')

    cy.get('[data-cy=bill-row]').should('have.length', 3);

    // should interact correctly with dateInput and payerSelect '
    cy.get('[data-cy=select-tpp]').eq(1).click();
    cy.get('[data-cy=select-tpp]').eq(1).type('{backspace}Avec{downarrow}{enter}');
    cy.get('[data-cy=bill-row]').should('have.length', 1);
    cy.get('[data-cy=col-customer]').should('contain', 'YAFFA E.');
    cy.get('[data-cy=col-externalBilling]').within(() => {
      cy.get('.q-checkbox__inner').should('have.class', 'q-checkbox__inner--falsy');
      cy.get('.q-checkbox').click();
      cy.get('.q-checkbox__inner').should('have.class', 'q-checkbox__inner--truthy');
      cy.get('.q-checkbox').click();
    });

    cy.get('[data-cy=select-tpp]').eq(1).click();
    cy.get('[data-cy=select-tpp]').eq(1).type('{backspace}Sans{downarrow}{enter}');
    cy.get('[data-cy=bill-row]').should('have.length', 2);

    cy.get('[data-cy=date-input]  input').eq(0).clear().type('01/01/2019');
    cy.get('[data-cy=date-input]  input').eq(1).clear().type('17/01/2019');
    cy.get('[data-cy=bill-row]').should('have.length', 1);
    cy.get('[data-cy=col-customer]').should('contain', 'AUFRAY H.');
    cy.get('[data-cy=col-tick-bill]').within(() => {
      cy.get('.q-checkbox__inner').should('have.class', 'q-checkbox__inner--falsy');
      cy.get('.q-checkbox').click();
    });

    cy.get('[data-cy=to-bill-button]').click();
    cy.get('.q-dialog__title').eq(0).should('contain', 'Confirmation');
    cy.get('.q-checkbox__label').eq(0).should('contain', 'Envoyer par email');
    cy.get('.q-card__actions').within(() => {
      cy.get('.q-btn__content').eq(0).click();
    });
    cy.get('[data-cy=bill-row]').should('have.length', 1);

    cy.get('[data-cy=select-tpp]').eq(1).click();
    cy.get('[data-cy=select-tpp]').eq(1).type('{backspace}Tous{downarrow}{enter}');
    cy.get('[data-cy=date-input]  input').eq(1).clear().type('01/01/2020');
    cy.get('[data-cy=bill-row]').should('have.length', 3);

    // should bill correctly
    cy.get('[data-cy=client-table]').within(() => {
      cy.get('th').eq(11).within(() => {
        cy.get('.q-checkbox__inner').should('have.class', 'q-checkbox__inner--falsy');
        cy.get('.q-checkbox').click();
      });
    });

    cy.get('[data-cy=col-tick-bill]').eq(0).within(() => {
      cy.get('.q-checkbox__inner').should('have.class', 'q-checkbox__inner--truthy');
      cy.get('.q-checkbox').click();
      cy.get('.q-checkbox__inner').should('have.class', 'q-checkbox__inner--falsy');
    });
    cy.get('[data-cy=col-tick-bill]').eq(1)
      .get('.q-checkbox__inner').should('have.class', 'q-checkbox__inner--truthy');
    cy.get('[data-cy=col-tick-bill]').eq(2)
      .get('.q-checkbox__inner').should('have.class', 'q-checkbox__inner--truthy');

    cy.get('[data-cy=to-bill-button]').click();
    cy.get('.q-card__actions').within(() => {
      cy.get('.q-btn__content').eq(1).click();
    });

    cy.get('[data-cy=bill-row]').should('have.length', 1);
    cy.get('[data-cy=col-customer]').should('contain', 'ANDTHEQUEENS C.');
  });
});
