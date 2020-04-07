<template>
  <q-page padding class="neutral-background">
    <h4>Contact</h4>
    <div v-if="company && company.billingAssistance">
      Pour toutes les questions concernant la facturation ou l’utilisation de votre espace Compani,
      merci de nous adresser un email à
      <a :href="'mailto:' + company.billingAssistance">{{ company.billingAssistance }} </a>.
      Nous vous répondrons dans les plus brefs délais.
    </div>
  </q-page>
</template>

<script>
import Customers from '@api/Customers';

export default {
  name: 'Contact',
  metaInfo: { title: 'Contact' },
  async mounted () {
    if (!this.customer) await this.refreshCustomer();
  },
  computed: {
    customer () {
      return this.$store.getters['customer/getCustomer'];
    },
    helper () {
      return this.$store.getters['main/loggedUser'];
    },
    company () {
      return this.helper.company;
    },
  },
  methods: {
    async refreshCustomer () {
      try {
        const customer = await Customers.getById(this.helper.customers[0]._id);
        this.$store.commit('customer/saveCustomer', customer);
      } catch (e) {
        console.error(e);
      }
    },
  },
}
</script>
