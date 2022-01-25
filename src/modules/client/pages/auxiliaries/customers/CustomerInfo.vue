<template>
  <q-page padding class="client-background">
    <div v-if="customer">
      <customer-profil-header :profile-id="customerId" :title="formatIdentity(customer.identity, 'FL')" />
      <profile-follow-up />
    </div>
  </q-page>
</template>

<script>
import { createMetaMixin } from 'quasar';
import { mapState } from 'vuex';
import { formatIdentity } from '@helpers/utils';
import ProfileFollowUp from 'src/modules/client/components/customers/ProfileFollowUp';
import CustomerProfileHeader from '../../../components/customers/CustomerProfileHeader';

const metaInfo = { title: 'Fiche bénéficiaire' };

export default {
  components: {
    'profile-follow-up': ProfileFollowUp,
    'customer-profil-header': CustomerProfileHeader,
  },
  props: {
    customerId: { type: String, required: true },
  },
  mixins: [createMetaMixin(metaInfo)],
  computed: {
    ...mapState('customer', ['customer']),
  },
  async mounted () {
    await this.$store.dispatch('customer/fetchCustomer', { customerId: this.customerId });
  },
  methods: {
    formatIdentity,
  },
  beforeUnmount () {
    this.$store.dispatch('customer/resetCustomer');
  },
};
</script>
