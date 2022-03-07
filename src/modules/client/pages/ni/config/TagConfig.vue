<template>
  <q-page class="client-background" padding>
    <div class="q-mb-xl">
      <div v-for="(section, i) in tagSections" :key="i" class="q-mb-lg">
        <div class="text-weight-bold">{{ section.name }}</div>
        <table>
          <th>Nom tag</th>
          <th>Description</th>
          <tr v-for="(tag, index) in section.items" :key="index">
            <td>{{ `{${index}\}` }}</td>
            <td>{{ tag }}</td>
          </tr>
        </table>
      </div>
    </div>
  </q-page>
</template>

<script>
import { createMetaMixin } from 'quasar';

const metaInfo = { title: 'Tags' };

export default {
  name: 'TagConfig',
  mixins: [createMetaMixin(metaInfo)],
  data () {
    return {
      contractTags: {
        auxiliaryTitle: 'Civilité',
        auxiliaryFirstname: 'Prénom',
        auxiliaryLastname: 'Nom',
        auxiliaryAddress: 'Adresse',
        auxiliaryStreet: 'Rue',
        auxiliaryCity: 'Ville',
        auxiliaryZipCode: 'Code postal',
        auxiliaryBirthDate: 'Date de naissance',
        auxiliaryNationality: 'Nationalité',
        auxiliaryBirthCountry: 'Pays de naissance',
        auxiliaryBirthState: 'Département de naissance',
        auxiliaryBirthCity: 'Ville de naissance',
        auxiliarySSN: 'Numéro de sécurité sociale',
        grossHourlyRate: 'Taux horaire brut',
        monthlyHours: 'Volume d\'heures mensuel (Volume d\'heures hebdomadaire * 4,33)',
        salary: 'Salaire mensuel (Volume d\'heures mensuel * taux horaire brut)',
        startDate: 'Date d\'effet du contrat / de la version',
        weeklyHours: 'Volume horaire hebdomadaire (contrat de travail)',
        yearlyHours: 'Volume horaire annuel (Volume d\'heure mensuel * 52)',
        uploadDate: 'Date de mise en ligne du contrat',
        initialContractStartDate: 'Date d’effet du contrat initial',
        initialContractMonthlyHours: 'Volume d\'heures mensuel du contrat initial',
        companySIRET: 'SIRET de l\'établissement',
      },
      mandateTags: {
        customerTitle: 'Civilité',
        customerFirstname: 'Prénom du/de la bénéficiaire',
        customerLastname: 'Nom du/de la bénéficiaire',
        customerAddress: 'Adresse du/de la bénéficiaire',
        customerStreet: 'Rue du/de la bénéficiaire',
        customerCity: 'Ville du/de la bénéficiaire',
        customerZipCode: 'Code postal du/de la bénéficiaire',
        ics: 'ICS',
        companyName: 'Nom de l’organisation',
        companyAddress: 'Adresse de l\'organisation',
        companyStreet: 'Rue de l\'organisation',
        companyCity: 'Ville de l\'organisation',
        companyZipCode: 'Code postal de l\'organisation',
        downloadDate: 'Date de téléchargement',
        rcs: 'RCS de l’organisation',
        rum: 'RUM',
        iban: 'IBAN',
        bic: 'BIC',
        bankAccountOwner: 'Nom associé au compte bancaire',
      },
      quoteTags: {
        customerTitle: 'Civilité',
        customerFirstname: 'Prénom du/de la bénéficiaire',
        customerLastname: 'Nom du/de la bénéficiaire',
        customerAddress: 'Adresse du/de la bénéficiaire',
        customerStreet: 'Rue du/de la bénéficiaire',
        customerCity: 'Ville du/de la bénéficiaire',
        customerZipCode: 'Code postal du/de la bénéficiaire',
        ics: 'ICS',
        companyName: 'Nom de l’organisation',
        companyAddress: 'Adresse de l\'organisation',
        companyStreet: 'Rue de l\'organisation',
        companyCity: 'Ville de l\'organisation',
        companyZipCode: 'Code postal de l\'organisation',
        downloadDate: 'Date de téléchargement',
        rcs: 'RCS de l’organisation',
        serviceName: 'Nom du service',
        serviceNature: 'Nature du service',
        unitTTCRate: 'Tarif horaire TTC',
        weeklyRate: 'Tarif hebdomadaire estimé',
        billingItemsTTCRate: 'Tarif total TTC des articles de facturation',
        serviceBillingItems: 'Liste des articles de facturation',
        weeklyVolume: 'Volume hebdomadaire estimé total',
        weeklyCount: 'Nombre hebdomadaire d\'interventions estimé',
        sundays: 'Dont dimanche',
        saturdays: 'Dont samedi',
        evenings: 'Dont soir après 20h',
        quoteNumber: 'Numéro du devis',
        subscriptions: 'Liste des services souscrits',
      },
    };
  },
  computed: {
    tagSections () {
      return [
        { name: 'Contrat', items: this.contractTags },
        { name: 'Mandat', items: this.mandateTags },
        { name: 'Devis', items: this.quoteTags },
      ];
    },
  },
};
</script>

<style lang="sass" scoped>
  th
    text-align: left
</style>
