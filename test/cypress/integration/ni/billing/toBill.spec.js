const { BILLING } = require('../../../../../src/core/data/constants');

describe('ToBill', () => {
  beforeEach(() => {
    cy.initiateTest({ seedType: BILLING, credentials: { email: 'client-admin@alenvi.io', password: '123456!eR' } });
    cy.visit('/ni/billing/to-bill');
    cy.get('#q-app').click(500, 500);
  });

  it('should display, interact and bill correctly', () => {
    // should display correctly to-bill
    cy.dataCy('client-table').within(() => {
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

    cy.dataCy('col-customer').should('contain', 'ANDTHEQUEENS C.');
    cy.dataCy('col-client').should('contain', 'ANDTHEQUEENS C.');
    cy.dataCy('col-startDate').should('contain', '19/01/2019');
    cy.dataCy('col-service').should('contain', 'Service 2');
    cy.dataCy('col-hours').should('contain', '5.00h');
    cy.dataCy('col-unitExclTaxes').should('contain', '10,71');
    cy.dataCy('col-discount').should('contain', '0,00');
    cy.dataCy('col-exclTaxes').should('contain', '53,57');
    cy.dataCy('col-inclTaxes').should('contain', '60,00');

    cy.dataCy('bill-row').should('have.length', 3);

    // should interact correctly with date input and thirdPartyPayer select'
    cy.dataCy('select-tpp').eq(0).click();
    cy.dataCy('select-tpp').eq(0).type('{backspace}Avec{downarrow}{enter}');
    cy.dataCy('bill-row').should('have.length', 1);
    cy.dataCy('col-customer').should('contain', 'YAFFA E.');
    cy.dataCy('col-externalBilling').within(() => {
      cy.get('.q-checkbox__inner').should('have.class', 'q-checkbox__inner--falsy');
      cy.get('.q-checkbox').click();
      cy.get('.q-checkbox__inner').should('have.class', 'q-checkbox__inner--truthy');
      cy.get('.q-checkbox').click();
    });

    cy.dataCy('select-tpp').eq(0).click();
    cy.dataCy('select-tpp').eq(0).type('{backspace}Sans{downarrow}{enter}');
    cy.dataCy('bill-row').should('have.length', 2);

    cy.get('[data-cy=date-input]  input').eq(0).clear();
    cy.get('[data-cy=date-input]  input').eq(0).type('01/01/2019');
    cy.get('[data-cy=date-input]  input').eq(1).clear();
    cy.get('[data-cy=date-input]  input').eq(1).type('17/01/2019');
    cy.dataCy('bill-row').should('have.length', 1);
    cy.dataCy('col-customer').should('contain', 'AUFRAY H.');
    cy.dataCy('col-endDate').should('contain', '17/01/2019');
    cy.dataCy('col-selected-bill').within(() => {
      cy.get('.q-checkbox__inner').should('have.class', 'q-checkbox__inner--falsy');
      cy.get('.q-checkbox').click();
    });

    cy.dataCy('to-bill-button').click();
    cy.get('div.q-dialog__title').eq(0).should('contain', 'Confirmation');
    cy.get('div.q-checkbox__label').eq(0).should('contain', 'Envoyer par email');
    cy.get('div.q-card__actions').within(() => {
      cy.get('.q-btn__content').eq(0).click();
    });
    cy.dataCy('bill-row').should('have.length', 1);

    cy.dataCy('select-tpp').eq(0).click();
    cy.dataCy('select-tpp').eq(0).type('{backspace}Tous{downarrow}{enter}');
    cy.get('[data-cy=date-input]  input').eq(1).clear();
    cy.get('[data-cy=date-input]  input').eq(1).type('01/01/2021');
    cy.dataCy('bill-row').should('have.length', 3);

    // should bill correctly
    cy.dataCy('client-table').within(() => {
      cy.get('th').eq(11).within(() => {
        cy.get('.q-checkbox__inner').should('have.class', 'q-checkbox__inner--falsy');
        cy.get('.q-checkbox').click();
      });
    });

    cy.dataCy('col-selected-bill').eq(0).within(() => {
      cy.get('.q-checkbox__inner').should('have.class', 'q-checkbox__inner--truthy');
      cy.get('.q-checkbox').click();
      cy.get('.q-checkbox__inner').should('have.class', 'q-checkbox__inner--falsy');
    });
    cy.dataCy('col-selected-bill').eq(1)
      .get('.q-checkbox__inner').should('have.class', 'q-checkbox__inner--truthy');
    cy.dataCy('col-selected-bill').eq(2)
      .get('.q-checkbox__inner').should('have.class', 'q-checkbox__inner--truthy');

    cy.dataCy('to-bill-button').click();
    cy.get('div.q-card__actions').within(() => {
      cy.get('.q-btn__content').eq(1).click();
    });

    cy.dataCy('bill-row').should('have.length', 1);
    cy.dataCy('col-customer').should('contain', 'ANDTHEQUEENS C.');
  });

  it('should bill a ttp customer with external option', () => {
    cy.dataCy('bill-row').should('have.length', 3);
    cy.dataCy('col-externalBilling').within(() => {
      cy.get('.q-checkbox__inner').should('have.class', 'q-checkbox__inner--falsy');
      cy.get('.q-checkbox').click();
    });
    cy.dataCy('col-selected-bill').eq(2).within(() => {
      cy.get('.q-checkbox__inner').should('have.class', 'q-checkbox__inner--falsy');
      cy.get('.q-checkbox').click();
    });

    cy.dataCy('to-bill-button').click();
    cy.get('div.q-card__actions').within(() => {
      cy.get('.q-btn__content').eq(1).click();
    });

    cy.dataCy('bill-row').should('have.length', 2);
  });
});
