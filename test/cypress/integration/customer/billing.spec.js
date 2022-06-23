const { BILLING } = require('../../../../src/core/data/constants');

describe('Customer billing tests', () => {
  beforeEach(() => {
    cy.initiateTest({ seedType: BILLING, credentials: { email: 'helper@alenvi.io', password: '123456!eR' } });
    cy.visit('/customers/documents');
    cy.get('#q-app').click(500, 500);
  });

  it('should display correctly customer billing page', () => {
    cy.get('[data-cy=date-input] input').eq(0).clear();
    cy.get('[data-cy=date-input] input').eq(0).type('01/05/2020');
    cy.get('[data-cy=date-input] input').eq(1).clear();
    cy.get('[data-cy=date-input] input').eq(1).type('30/09/2020');
    cy.get('[data-cy=start-period] td').and(($tds) => {
      expect($tds.eq(0)).to.have.text('01/05/2020');
    });
    cy.get('[data-cy=end-period] td').and(($tds) => {
      expect($tds.eq(0)).to.have.text('30/09/2020');
    });

    cy.get('th').should('have.length', 15).and(($th) => {
      expect($th.eq(0)).to.have.text('Date');
      expect($th.eq(1)).to.have.text('');
      expect($th.eq(2)).to.have.text('');
      expect($th.eq(3)).to.have.text('Montant TTC');
      expect($th.eq(4)).to.have.text('Solde');
      expect($th.eq(5)).to.have.text('');
      expect($th.eq(6)).to.have.text('Date');
      expect($th.eq(7)).to.have.text('');
      expect($th.eq(8)).to.have.text('');
      expect($th.eq(9)).to.have.text('Montant TTC');
      expect($th.eq(10)).to.have.text('Solde');
      expect($th.eq(11)).to.have.text('');
      expect($th.eq(12)).to.have.text('Attestation');
      expect($th.eq(13)).to.have.text('Date');
      expect($th.eq(14)).to.have.text('');
    });
  });

  it('should display correctly customer billing table', () => {
    cy.get('[data-cy=date-input] input').eq(0).clear();
    cy.get('[data-cy=date-input] input').eq(0).type('01/05/2020');
    cy.get('[data-cy=date-input] input').eq(1).clear();
    cy.get('[data-cy=date-input] input').eq(1).type('30/09/2020');

    cy.dataCy('customer-identity').should('contain', 'Romain BARDET');
    cy.get('[data-cy=start-period] td').and(($tds) => {
      expect($tds.eq(0)).to.have.text('01/05/2020');
      expect($tds.eq(1)).to.have.text('Début de période');
      expect($tds.eq(2)).to.have.text('');
      expect($tds.eq(3)).to.have.text('');
      expect($tds.eq(4)).to.have.text('0,00\u00A0€');
      expect($tds.eq(5)).to.have.text('');
    });

    cy.dataCy('col-date').eq(0).should('contain', '30/06/2020');
    cy.dataCy('col-date').eq(1).should('contain', '23/07/2020');
    cy.dataCy('col-date').eq(2).should('contain', '23/07/2020');

    cy.dataCy('col-document').eq(0).should('contain', 'Facture FACT-101062000002');
    cy.dataCy('col-document').eq(1)
      .should('contain', 'Paiement REG-101072000201 (Prélèvement)');
    cy.dataCy('col-document').eq(2)
      .should('contain', 'Remboursement REMB-101072000201 (Virement)');

    cy.dataCy('col-inclTaxes').eq(0).should('contain', '-10,00\u00A0€');
    cy.dataCy('col-inclTaxes').eq(1).should('contain', '10,00\u00A0€');
    cy.dataCy('col-inclTaxes').eq(2).should('contain', '-5,00\u00A0€');

    cy.dataCy('balance-icon').eq(0).should(($icon) => {
      expect($icon[0].className).to.match(/mdi-minus-circle-outline/);
    });
    cy.dataCy('balance-amount').eq(0).should('have.text', '10,00\u00A0€');
    cy.dataCy('balance-icon').eq(1).should(($icon) => {
      expect($icon[0].className).to.match(/mdi-plus-circle-outline/);
    });
    cy.dataCy('balance-amount').eq(1).should('have.text', '0,00\u00A0€');
    cy.dataCy('balance-icon').eq(2).should(($icon) => {
      expect($icon[0].className).to.match(/mdi-minus-circle-outline/);
    });
    cy.dataCy('balance-amount').eq(2).should('have.text', '5,00\u00A0€');

    cy.get('[data-cy=end-period] td').and(($tds) => {
      expect($tds.eq(0)).to.have.text('30/09/2020');
      expect($tds.eq(1)).to.have.text('Fin de période');
      expect($tds.eq(2)).to.have.text('');
      expect($tds.eq(3)).to.have.text('');
      expect($tds.eq(4)).to.have.text('-5,00\u00A0€');
      expect($tds.eq(5)).to.have.text('');
    });

    cy.server();
    cy.route('GET', '/bills/*/pdfs').as('pdf');
    cy.dataCy('link').eq(0).click().wait('@pdf')
      .then((xhr) => { expect(xhr.status).to.equal(200); });
  });

  it('should display correctly tpp billing table', () => {
    cy.get('[data-cy=date-input] input').eq(0).clear();
    cy.get('[data-cy=date-input] input').eq(0).type('01/05/2020');
    cy.get('[data-cy=date-input] input').eq(1).clear();
    cy.get('[data-cy=date-input] input').eq(1).type('30/09/2020');

    cy.dataCy('tpp-identity').should('contain', 'Toto');
    cy.get('[data-cy=start-period] td').and(($tds) => {
      expect($tds.eq(6)).to.have.text('01/05/2020');
      expect($tds.eq(7)).to.have.text('Début de période');
      expect($tds.eq(8)).to.have.text('');
      expect($tds.eq(9)).to.have.text('');
      expect($tds.eq(10)).to.have.text('0,00\u00A0€');
      expect($tds.eq(11)).to.have.text('');
    });

    cy.dataCy('col-date').eq(3).should('contain', '30/06/2020');
    cy.dataCy('col-date').eq(4).should('contain', '23/07/2020');

    cy.dataCy('col-document').eq(3).should('contain', 'Facture FACT-101062000001');
    cy.dataCy('col-document').eq(4)
      .should('contain', 'Paiement REG-101072000202 (Prélèvement)');

    cy.dataCy('col-inclTaxes').eq(3).should('contain', '-20,00\u00A0€');
    cy.dataCy('col-inclTaxes').eq(4).should('contain', '20,00\u00A0€');

    cy.dataCy('balance-icon').eq(3).should(($icon) => {
      expect($icon[0].className).to.match(/mdi-minus-circle-outline/);
    });
    cy.dataCy('balance-amount').eq(3).should('have.text', '20,00\u00A0€');
    cy.dataCy('balance-icon').eq(4).should(($icon) => {
      expect($icon[0].className).to.match(/mdi-plus-circle-outline/);
    });
    cy.dataCy('balance-amount').eq(4).should('have.text', '0,00\u00A0€');

    cy.get('[data-cy=end-period] td').and(($tds) => {
      expect($tds.eq(6)).to.have.text('30/09/2020');
      expect($tds.eq(7)).to.have.text('Fin de période');
      expect($tds.eq(8)).to.have.text('');
      expect($tds.eq(9)).to.have.text('');
      expect($tds.eq(10)).to.have.text('0,00\u00A0€');
      expect($tds.eq(11)).to.have.text('');
    });

    cy.server();
    cy.route('GET', '/bills/*/pdfs').as('pdf');
    cy.dataCy('link').eq(1).click().wait('@pdf')
      .then((xhr) => { expect(xhr.status).to.equal(200); });
  });

  it('should correctly display tax certificate table', () => {
    cy.get('[data-cy=tax-certificate] td').should('have.length', 3).and(($tds) => {
      expect($tds.eq(0)).to.have.text('2019');
      expect($tds.eq(1)).to.have.text('31/05/2020');
      expect($tds.eq(2)).to.contain('file_download');
    });

    cy.server();
    cy.route('GET', '/taxcertificates/*/pdfs').as('pdf');
    cy.dataCy('link').eq(0).click().wait('@pdf')
      .then((xhr) => { expect(xhr.status).to.equal(200); });
  });
});
