describe('Customer billing tests', () => {
  beforeEach(() => {
    cy.request(`${Cypress.env('API_HOSTNAME')}/end-to-end/seed/billing`);
    cy.login({ email: 'helper@alenvi.io', password: '123456!eR' });
    cy.visit('/customers/documents');
    cy.get('#q-app').click(500, 500);
  });

  const twoMonthBefore = Cypress.moment().subtract(2, 'M');
  const oneMonthBefore = Cypress.moment().subtract(1, 'M');

  it('should display correctly customer billing page', () => {
    cy.get('[data-cy=date-input] input').should('have.length', 2).and(($inputs) => {
      expect($inputs.eq(0).val()).to.equal(twoMonthBefore.startOf('M').format('DD/MM/YYYY'));
      expect($inputs.eq(1).val()).to.equal(Cypress.moment().format('DD/MM/YYYY'));
    });

    cy.get('th').should('have.length', 13).and(($th) => {
      expect($th.eq(0)).to.have.text('Date');
      expect($th.eq(1)).to.have.text('');
      expect($th.eq(2)).to.have.text('Montant TTC');
      expect($th.eq(3)).to.have.text('Solde');
      expect($th.eq(4)).to.have.text('');
      expect($th.eq(5)).to.have.text('Date');
      expect($th.eq(6)).to.have.text('');
      expect($th.eq(7)).to.have.text('Montant TTC');
      expect($th.eq(8)).to.have.text('Solde');
      expect($th.eq(9)).to.have.text('');
      expect($th.eq(10)).to.have.text('Attestation');
      expect($th.eq(11)).to.have.text('Date');
      expect($th.eq(12)).to.have.text('');
    });

    cy.get('[data-cy=date-input] input').eq(0).clear()
    cy.get('[data-cy=date-input] input').eq(0).type(Cypress.moment().subtract(4, 'M').format('DD/MM/YYYY'))
    cy.get('[data-cy=date-input] input').eq(1).clear()
    cy.get('[data-cy=date-input] input').eq(1).type(Cypress.moment().add(4, 'M').format('DD/MM/YYYY'))
    cy.get('[data-cy=start-period] td').and(($tds) => {
      expect($tds.eq(0)).to.have.text(Cypress.moment().subtract(4, 'M').format('DD/MM/YY'));
    });
    cy.get('[data-cy=end-period] td').and(($tds) => {
      expect($tds.eq(0)).to.have.text(Cypress.moment().add(4, 'M').format('DD/MM/YY'));
    });
  });

  it('should display correctly customer billing table', () => {
    cy.get('[data-cy=customer-identity]').should('contain', 'Romain BARDET');
    cy.get('[data-cy=start-period] td').and(($tds) => {
      expect($tds.eq(0)).to.have.text(twoMonthBefore.startOf('M').format('DD/MM/YY'));
      expect($tds.eq(1)).to.have.text('Début de période');
      expect($tds.eq(2)).to.have.text('');
      expect($tds.eq(3)).to.have.text('0,00\u00A0€');
      expect($tds.eq(4)).to.have.text('');
    });

    cy.get('[data-cy=col-date]').eq(0).should('contain', twoMonthBefore.endOf('M').format('DD/MM/YYYY'));
    cy.get('[data-cy=col-date]').eq(1).should('contain', oneMonthBefore.date(5).format('DD/MM/YYYY'));
    cy.get('[data-cy=col-date]').eq(2).should('contain', oneMonthBefore.date(5).format('DD/MM/YYYY'));

    cy.get('[data-cy=col-document]').eq(0).should('contain', `Facture FACT-101${twoMonthBefore.format('MMYY')}00002`);
    cy.get('[data-cy=col-document]').eq(1).should('contain', `Paiement REG-101${oneMonthBefore.format('MMYY')}00201 (Prélèvement)`);
    cy.get('[data-cy=col-document]').eq(2).should('contain', `Remboursement REMB-101${oneMonthBefore.format('MMYY')}00201 (Virement)`);

    cy.get('[data-cy=col-inclTaxes]').eq(0).should('contain', '-10,00\u00A0€');
    cy.get('[data-cy=col-inclTaxes]').eq(1).should('contain', '10,00\u00A0€');
    cy.get('[data-cy=col-inclTaxes]').eq(2).should('contain', '-5,00\u00A0€');

    cy.get('[data-cy=balance-icon]').eq(0).should(($icon) => {
      expect($icon[0].className).to.match(/mdi-minus-circle-outline/);
    });
    cy.get('[data-cy=balance-amount]').eq(0).should('have.text', '10,00\u00A0€');
    cy.get('[data-cy=balance-icon]').eq(1).should(($icon) => {
      expect($icon[0].className).to.match(/mdi-plus-circle-outline/);
    });
    cy.get('[data-cy=balance-amount]').eq(1).should('have.text', '0,00\u00A0€');
    cy.get('[data-cy=balance-icon]').eq(2).should(($icon) => {
      expect($icon[0].className).to.match(/mdi-minus-circle-outline/);
    });
    cy.get('[data-cy=balance-amount]').eq(2).should('have.text', '5,00\u00A0€');

    cy.get('[data-cy=end-period] td').and(($tds) => {
      expect($tds.eq(0)).to.have.text(Cypress.moment().format('DD/MM/YY'));
      expect($tds.eq(1)).to.have.text('Fin de période');
      expect($tds.eq(2)).to.have.text('');
      expect($tds.eq(3)).to.have.text('-5,00\u00A0€');
      expect($tds.eq(4)).to.have.text('');
    });

    cy.get('[data-cy=link]').eq(0).then(($a) => {
      const href = $a.prop('href');
      expect(href).to.match(/^http(s)?:\/\/.*\/bills\/[0-9a-fA-F]{24}\/pdfs\?x-access-token=.*$/);
      cy.request(href).its('status').should('equal', 200);
    });
  });

  it('should display correctly tpp billing table', () => {
    cy.get('[data-cy=tpp-identity]').should('contain', 'Toto');
    cy.get('[data-cy=start-period] td').and(($tds) => {
      expect($tds.eq(5)).to.have.text(twoMonthBefore.startOf('M').format('DD/MM/YY'));
      expect($tds.eq(6)).to.have.text('Début de période');
      expect($tds.eq(7)).to.have.text('');
      expect($tds.eq(8)).to.have.text('0,00\u00A0€');
      expect($tds.eq(9)).to.have.text('');
    });

    cy.get('[data-cy=col-date]').eq(3).should('contain', twoMonthBefore.endOf('M').format('DD/MM/YYYY'));
    cy.get('[data-cy=col-date]').eq(4).should('contain', oneMonthBefore.date(5).format('DD/MM/YYYY'));

    cy.get('[data-cy=col-document]').eq(3).should('contain', `Facture FACT-101${twoMonthBefore.format('MMYY')}00001`);
    cy.get('[data-cy=col-document]').eq(4).should('contain', `Paiement REG-101${oneMonthBefore.format('MMYY')}00202 (Prélèvement)`);

    cy.get('[data-cy=col-inclTaxes]').eq(3).should('contain', '-20,00\u00A0€');
    cy.get('[data-cy=col-inclTaxes]').eq(4).should('contain', '20,00\u00A0€');

    cy.get('[data-cy=balance-icon]').eq(3).should(($icon) => {
      expect($icon[0].className).to.match(/mdi-minus-circle-outline/);
    });
    cy.get('[data-cy=balance-amount]').eq(3).should('have.text', '20,00\u00A0€');
    cy.get('[data-cy=balance-icon]').eq(4).should(($icon) => {
      expect($icon[0].className).to.match(/mdi-plus-circle-outline/);
    });
    cy.get('[data-cy=balance-amount]').eq(4).should('have.text', '0,00\u00A0€');

    cy.get('[data-cy=end-period] td').and(($tds) => {
      expect($tds.eq(5)).to.have.text(Cypress.moment().format('DD/MM/YY'));
      expect($tds.eq(6)).to.have.text('Fin de période');
      expect($tds.eq(7)).to.have.text('');
      expect($tds.eq(8)).to.have.text('0,00\u00A0€');
      expect($tds.eq(9)).to.have.text('');
    });

    cy.get('[data-cy=link]').eq(1).then(($a) => {
      const href = $a.prop('href');
      expect(href).to.match(/^http(s)?:\/\/.*\/bills\/[0-9a-fA-F]{24}\/pdfs\?x-access-token=.*$/);
      cy.request(href).its('status').should('equal', 200);
    });
  });

  it('should correctly display tax certificate table', () => {
    cy.get('[data-cy=tax-certificate] td').should('have.length', 3).and(($tds) => {
      expect($tds.eq(0)).to.have.text(Cypress.moment().subtract(1, 'y').format('YYYY'));
      expect($tds.eq(1)).to.have.text(Cypress.moment().subtract(1, 'y').endOf('y').format('DD/MM/YYYY'));
      expect($tds.eq(2)).to.contain('file_download');
    });
    cy.get('[data-cy=link]').eq(2).then(($a) => {
      const href = $a.prop('href');
      expect(href).to.match(/^http(s)?:\/\/.*\/taxcertificates\/[0-9a-fA-F]{24}\/pdfs\?x-access-token=.*$/);
      cy.request(href).its('status').should('equal', 200);
    })
  })
});
