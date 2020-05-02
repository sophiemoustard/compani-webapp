describe('Customer billing tests', () => {
  before(() => {
    cy.request(`${Cypress.env('API_HOSTNAME')}/end-to-end/seed`);
    cy.login({ email: 'helper@alenvi.io', password: '123456!eR' });
    cy.visit('/customers/documents');
  });

  const twoMonthBefore = Cypress.moment().subtract(2, 'M');
  const oneMonthBefore = Cypress.moment().subtract(1, 'M');

  const paramsArray = [
    {
      table: 'customer',
      identity: 'Romain BARDET',
      startPeriodAmount: '0,00\u00A0€',
      datesCol: [
        twoMonthBefore.endOf('M').format('DD/MM/YYYY'),
        oneMonthBefore.date(5).format('DD/MM/YYYY'),
        oneMonthBefore.date(5).format('DD/MM/YYYY'),
      ],
      documentsCol: [
        `Facture FACT-101${twoMonthBefore.format('MMYY')}00002`,
        `Paiement REG-101${oneMonthBefore.format('MMYY')}00201 (Prélèvement)`,
        `Remboursement REMB-101${oneMonthBefore.format('MMYY')}00201 (Virement)`,
      ],
      inclTaxesCol: ['-10,00\u00A0€', '10,00\u00A0€', '-5,00\u00A0€'],
      balancesCol: [
        { icon: /mdi-minus-circle-outline/, label: '10,00\u00A0€' },
        { icon: /mdi-plus-circle-outline/, label: '0,00\u00A0€' },
        { icon: /mdi-minus-circle-outline/, label: '5,00\u00A0€' },
      ],
      endPeriodAmount: '-5,00\u00A0€',
    },
    {
      table: 'thirdPartyPayer',
      identity: 'Toto',
      startPeriodAmount: '0,00\u00A0€',
      datesCol: [
        twoMonthBefore.endOf('M').format('DD/MM/YYYY'),
        oneMonthBefore.date(5).format('DD/MM/YYYY'),
      ],
      documentsCol: [
        `Facture FACT-101${twoMonthBefore.format('MMYY')}00001`,
        `Paiement REG-101${oneMonthBefore.format('MMYY')}00202 (Prélèvement)`,
      ],
      inclTaxesCol: ['-20,00\u00A0€', '20,00\u00A0€'],
      balancesCol: [
        { icon: /mdi-minus-circle-outline/, label: '20,00\u00A0€' },
        { icon: /mdi-plus-circle-outline/, label: '0,00\u00A0€' },
      ],
      endPeriodAmount: '0,00\u00A0€',
    },
  ];
  paramsArray.forEach((param) => {
    it(`should display correctly customer billing page - ${param.table} table`, function () {
      cy.get('[data-cy=date-input] input').should('have.length', 2).and(($inputs) => {
        expect($inputs.eq(0).val()).to.equal(twoMonthBefore.startOf('M').format('DD/MM/YYYY'));
        expect($inputs.eq(1).val()).to.equal(Cypress.moment().format('DD/MM/YYYY'));
      });

      cy.get(`[data-cy=${param.table}-identity]`).should('contain', param.identity);
      cy.get(`[data-cy=start-period-${param.table}] td`).should('have.length', 5).and(($tds) => {
        expect($tds.eq(0)).to.have.text(twoMonthBefore.startOf('M').format('DD/MM/YY'));
        expect($tds.eq(1)).to.have.text('Début de période');
        expect($tds.eq(2)).to.not.have.text();
        expect($tds.eq(3)).to.have.text(param.startPeriodAmount);
        expect($tds.eq(4)).to.not.have.text();
      });

      cy.get(`[data-cy=${param.table}-billing-col-date]`).should('have.length', param.datesCol.length).and(($tds) => {
        param.datesCol.forEach((date, i) => expect($tds.eq(i)).to.have.text(date));
      });
      cy.get(`[data-cy=${param.table}-billing-col-document]`).should('have.length', param.documentsCol.length).and(($tds) => {
        param.documentsCol.forEach((doc, i) => expect($tds.eq(i)).to.contain(doc));
      });
      cy.get(`[data-cy=${param.table}-billing-col-inclTaxes]`).should('have.length', param.inclTaxesCol.length).and(($tds) => {
        param.inclTaxesCol.forEach((tax, i) => expect($tds.eq(i)).to.have.text(tax));
      });
      cy.get(`[data-cy=${param.table}-billing-col-balance]>div`).each(($el, i) => {
        cy.wrap($el).within(() => {
          cy.get('[data-cy=balance-icon]').should(($icon) => {
            expect($icon[0].className).to.match(param.balancesCol[i].icon);
          });
          cy.get('[data-cy=balance-amount]').should('have.text', param.balancesCol[i].label);
        })
      });

      cy.get(`[data-cy=end-period-${param.table}] td`).should('have.length', 5).and(($tds) => {
        expect($tds.eq(0)).to.have.text(Cypress.moment().format('DD/MM/YY'));
        expect($tds.eq(1)).to.have.text('Fin de période');
        expect($tds.eq(2)).to.not.have.text();
        expect($tds.eq(3)).to.have.text(param.endPeriodAmount);
        expect($tds.eq(4)).to.not.have.text();
      });

      cy.get(`[data-cy=${param.table}-bill-link]`).then(($a) => {
        const href = $a.prop('href');
        expect(href).to.match(/^http(s)?:\/\/.*\/bills\/[0-9a-fA-F]{24}\/pdfs\?x-access-token=.*$/);
        cy.request(href).its('status').should('equal', 200);
      });
    });
  })

  it('should correctly display tax certificate table', () => {
    cy.get('[data-cy=tax-certificate] td').should('have.length', 3).and(($tds) => {
      expect($tds.eq(0)).to.have.text(Cypress.moment().subtract(1, 'y').format('YYYY'));
      expect($tds.eq(1)).to.have.text(Cypress.moment().subtract(1, 'y').endOf('y').format('DD/MM/YYYY'));
      expect($tds.eq(2)).to.contain('file_download');
    });
    cy.get('[data-cy=tax-certificate-link]').then(($a) => {
      const href = $a.prop('href');
      expect(href).to.match(/^http(s)?:\/\/.*\/taxcertificates\/[0-9a-fA-F]{24}\/pdfs\?x-access-token=.*$/);
      cy.request(href).its('status').should('equal', 200);
    })
  })
});
