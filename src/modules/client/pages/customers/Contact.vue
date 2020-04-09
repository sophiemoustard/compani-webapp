<template>
  <q-page padding class="neutral-background">
    <h4>Contact</h4>
    <div class="referent-container" v-if="customer && customer.referent">
      Pour toutes les questions concernant l’organisation des interventions et le planning, nous vous invitons à
      contacter votre auxiliaire référent.
      <div class="items-center">
        <img :src="referentAvatar" class="avatar q-mr-sm" />
        {{ referentIdentity }}
      </div>
      <a v-if="referentPhoneNumber" class="text-primary" :href="referentPhoneLink">{{referentPhoneNumber}}</a>
    </div>
    <div v-if="company && company.billingAssistance">
      Pour toutes les questions concernant la facturation ou l’utilisation de votre espace Compani,
      merci de nous adresser un email à
      <a :href="'mailto:' + company.billingAssistance">{{ company.billingAssistance }}</a>.
      Nous vous répondrons dans les plus brefs délais.
    </div>
  </q-page>
</template>

<script>
import get from 'lodash/get';
import Customers from '@api/Customers';
import { formatIdentity } from '@helpers/utils.js';
import { DEFAULT_AVATAR, UNKNOWN_AVATAR } from '@data/constants';

export default {
  name: 'Contact',
  metaInfo: { title: 'Contact' },
  computed: {
    referentAvatar () {
      const auxiliaryPicture = get(this.customer, 'referent.picture') || null;
      return this.getReferentAvatar(auxiliaryPicture);
    },
    helper () {
      return this.$store.getters['main/loggedUser'];
    },
    company () {
      return this.helper.company;
    },
    customer () {
      return this.$store.getters['customer/getCustomer'];
    },
    referent () {
      return this.customer.referent;
    },
    referentIdentity () {
      return formatIdentity(this.customer.referent.identity, 'FL')
    },
    referentPhoneNumber () {
      const phoneNumber = get(this.referent, 'contact.phone');
      return phoneNumber ? `Numéro de téléphone: ${phoneNumber}` : '';
    },
    referentPhoneLink () {
      const phoneNumber = get(this.referent, 'contact.phone');
      return phoneNumber ? `tel:+33${phoneNumber.substring(1)}` : '';
    },
  },
  async mounted () {
    if (!this.customer) await this.refreshCustomer();
  },
  methods: {
    async refreshCustomer () {
      if (this.helper && this.helper.customers) {
        const customer = await Customers.getById(this.helper.customers[0]._id);
        this.$store.commit('customer/saveCustomer', customer);
      }
    },
    getReferentAvatar (picture) {
      return picture ? get(picture, 'link') || DEFAULT_AVATAR : UNKNOWN_AVATAR;
    },
  },
}
</script>

<style lang="stylus" scoped>
.referent-container
  margin-bottom: 20px;

.referent-container div
  margin-bottom: 10px;
  margin-top: 10px;
</style>
