const moment = require('moment');

describe('customers subscription tests', () => {
  beforeEach(() => {
    cy.request(`${Cypress.env('API_HOSTNAME')}/end-to-end/seed/billing`);
    cy.login({ email: 'helper@alenvi.io', password: '123456!eR' });
    cy.visit('/customers/subscriptions');
  });

  it('should display correctly the subscriptions part of the page', () => {
    cy.get('#q-app').click(500, 500);

    cy.dataCy('hourly-price').should('contain', 'Prix horaire (TTC) : 27,00\u00A0€ / heure');
    cy.dataCy('week-infos').should(
      'contain',
      'Coût estimé pour une semaine : 309,36\u00A0€ / semaine (dont 31,05\u00A0€ de majoration)'
    );
    cy.dataCy('intervention-hours').should(
      'contain',
      '12h d\'intervention par semaine (dont majorées : 3h le samedi, 1h le dimanche, 2h en soirée'
    );
    cy.dataCy('funding-reduction').should('contain', 'Prise en charge par Toto : 45,69\u00A0€ / semaine');
  });

  it('should interact correctly with the subscriptions part of the page', () => {
    cy.get('#q-app').click(500, 500);
    cy.get('.q-checkbox__inner').should('have.class', 'q-checkbox__inner--falsy');
    cy.get('.q-checkbox').click();
    cy.get('.q-checkbox__inner').should('have.class', 'q-checkbox__inner--truthy');
    cy.get('.q-checkbox').should('have.class', 'disabled');

    cy.dataCy('agreement').should(
      'contain',
      `(Accepté le ${moment().format('DD/MM/YYYY')} par Helper TEST)`
    );

    cy.dataCy('show-subscription-history').click();
    cy.dataCy('subscriptions-history').within(() => {
      cy.get('th').should('have.length', 6).and(($th) => {
        expect($th.eq(0)).to.have.text('Date de modification');
        expect($th.eq(1)).to.have.text('Prix unitaire TTC');
        expect($th.eq(2)).to.have.text('Volume hebdomadaire estimatif');
        expect($th.eq(3)).to.have.text('dont soirées');
        expect($th.eq(4)).to.have.text('dont samedis');
        expect($th.eq(5)).to.have.text('dont dimanches');
      });

      cy.dataCy('col-createdAt').eq(0).should('contain', '01/01/2020');
      cy.dataCy('col-unitTTCRate').eq(0).should('contain', '27,00\u00A0€');
      cy.dataCy('col-weeklyVolume').eq(0).should('contain', '12h');
      cy.dataCy('col-evenings').eq(0).should('contain', '2');
      cy.dataCy('col-saturdays').eq(0).should('contain', '3');
      cy.dataCy('col-sundays').eq(0).should('contain', '1');

      cy.dataCy('col-createdAt').eq(1).should('contain', '01/06/2019');
      cy.dataCy('col-unitTTCRate').eq(1).should('contain', '26,00\u00A0€');
      cy.dataCy('col-weeklyVolume').eq(1).should('contain', '8h');
      cy.dataCy('col-evenings').eq(1).should('contain', '');
      cy.dataCy('col-sundays').eq(1).should('contain', '2');
      cy.dataCy('col-saturdays').eq(1).should('contain', '');
    });

    cy.dataCy('close-modal').click();

    cy.dataCy('show-funding-detail').click();
    cy.dataCy('fundings-history').within(() => {
      cy.dataCy('col-startDate').should('contain', 'Date de début de prise en charge');
      cy.dataCy('col-thirdPartyPayer').should('contain', 'Tiers payeur');
      cy.dataCy('col-folderNumber').should('contain', 'Numéro de dossier');
      cy.dataCy('col-frequency').should('contain', 'Fréquence');
      cy.dataCy('col-unitTTCRate').should('contain', 'Prix unitaire TTC');
      cy.dataCy('col-customerParticipationRate').should('contain', 'Tx. participation bénéficiaire');
      cy.dataCy('col-careHours').should('contain', 'Nb. heures de prise en charge');
      cy.dataCy('col-careDays').should('contain', 'Jours de prise en charge');

      cy.dataCy('col-side-startDate').should('contain', '02/02/2020');
      cy.dataCy('col-side-thirdPartyPayer').should('contain', 'Toto');
      cy.dataCy('col-side-folderNumber').should('contain', 'D123456');
      cy.dataCy('col-side-frequency').should('contain', 'Mensuelle');
      cy.dataCy('col-side-unitTTCRate').should('contain', '22,00\u00A0€');
      cy.dataCy('col-side-customerParticipationRate').should('contain', '10%');
      cy.dataCy('col-side-careHours').should('contain', '10h');
      cy.dataCy('col-side-careDays').should('contain', 'Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi');
    });
  });

  it('should display correctly the payment part and open the modal for the mandate', () => {
    cy.get('#q-app').click(500, 500);

    cy.dataCy('bank-account-owner').should('have.value', 'David gaudu');
    cy.dataCy('iban').should('have.value', 'FR3617569000306699167186M11');
    cy.dataCy('bic').should('have.value', 'ABNAFRPP');

    cy.dataCy('mandate-table').within(() => {
      cy.get('th').should('have.length', 2).and(($th) => {
        expect($th.eq(0)).to.have.text('RUM');
        expect($th.eq(1)).to.have.text('Signature');
      });
    });

    cy.server();
    cy.route('POST', '/customers/*/mandates/*/esign').as('esign');

    cy.dataCy('open-mandate').click();
    cy.wait('@esign').should((xhr) => {
      expect(xhr.request.body.customer).to.deep.equal({
        name: 'Bardet',
        email: 'helper@alenvi.io',
      });
      expect(xhr.request.body.fields).to.deep.equal({
        bankAccountOwner: 'David gaudu',
        customerAddress: '12 rue de ponthieu 75008 Paris',
        ics: '9876',
        rum: 'R012345678903456789',
        bic: 'ABNAFRPP',
        iban: 'FR3617569000306699167186M11',
        companyName: 'Test SAS',
        companyAddress: '37 rue de Ponthieu 75008 Paris',
        downloadDate: Cypress.luxon.DateTime.now().toLocaleString(),
      });
    });

    cy.get('iframe');
    cy.dataCy('esign-modal').should('be.visible');
  });
});
