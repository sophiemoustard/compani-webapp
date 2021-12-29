<template>
  <q-page padding class="client-background">
    <ni-title-header title="Contact" class="q-mb-xl" />
    <div class="referent-container" v-if="referent">
      Pour toutes les questions concernant l’organisation des interventions et le planning, nous vous invitons à
      contacter votre auxiliaire référent(e).
      <div class="items-center row">
        <img :src="referentAvatar" class="avatar q-mr-sm">
        <div class="referent-info">
          <div data-cy="referent-identity">{{ referentIdentity }}</div>
          <div data-cy="referent-phone">
            Numéro de téléphone :
            <a v-if="referentPhoneNumber" class="text-primary" :href="referentPhoneLink">{{ referentPhoneNumber }}</a>
          </div>
        </div>
      </div>
    </div>
    <div v-if="company && company.billingAssistance">
      Pour toutes les questions concernant la facturation ou l’utilisation de votre espace Compani,
      merci de nous adresser un email à
      <a data-cy="billing-asssistance-email" :href="'mailto:' + company.billingAssistance">
        {{ company.billingAssistance }}
      </a>.
      Nous vous répondrons dans les plus brefs délais.
    </div>
  </q-page>
</template>

<script>
import { createMetaMixin } from 'quasar';
import { mapState, mapGetters } from 'vuex';
import get from 'lodash/get';
import Customers from '@api/Customers';
import TitleHeader from '@components/TitleHeader';
import { DEFAULT_AVATAR, UNKNOWN_AVATAR } from '@data/constants';
import { formatIdentity } from '@helpers/utils';

const metaInfo = { title: 'Contact' };

export default {
  name: 'Contact',
  components: {
    'ni-title-header': TitleHeader,
  },
  mixins: [createMetaMixin(metaInfo)],
  computed: {
    ...mapState({
      helper: state => state.main.loggedUser,
      customer: state => state.customer.customer,
    }),
    ...mapGetters({
      company: 'main/getCompany',
    }),
    referentAvatar () {
      const auxiliaryPicture = get(this.customer, 'referent.picture') || null;
      return auxiliaryPicture ? get(auxiliaryPicture, 'link') || DEFAULT_AVATAR : UNKNOWN_AVATAR;
    },
    referent () {
      return get(this.customer, 'referent');
    },
    referentIdentity () {
      return formatIdentity(this.referent.identity, 'FL');
    },
    referentPhoneNumber () {
      return get(this.referent, 'contact.phone') || '';
    },
    referentPhoneLink () {
      const phoneNumber = get(this.referent, 'contact.phone');
      return phoneNumber ? `tel:+33${phoneNumber.substring(1)}` : '';
    },
  },
  async created () {
    if (!this.customer) await this.refreshCustomer();
  },
  methods: {
    async refreshCustomer () {
      if (this.helper && this.helper.customers) {
        const customer = await Customers.getById(this.helper.customers[0]);
        this.$store.dispatch('customer/setCustomer', customer);
      }
    },
  },
};
</script>

<style lang="sass" scoped>
.referent-container
  margin-bottom: 20px

.referent-container > div
  margin-bottom: 10px
  margin-top: 10px

.referent-info
  padding-left: 10px
  display: flex
  flex-direction: column
</style>
