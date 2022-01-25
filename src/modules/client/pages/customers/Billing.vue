<template>
  <q-page padding class="client-background">
    <ni-title-header title="Facturation" class="q-mb-xl" />
    <ni-profile-billing v-if="customer" />
  </q-page>
</template>

<script>
import { createMetaMixin } from 'quasar';
import { mapState } from 'vuex';
import Customers from '@api/Customers';
import TitleHeader from '@components/TitleHeader';
import ProfileBilling from 'src/modules/client/components/customers/billing/ProfileBilling';

const metaInfo = { title: 'Facturation' };

export default {
  name: 'Billing',
  components: {
    'ni-title-header': TitleHeader,
    'ni-profile-billing': ProfileBilling,
  },
  mixins: [createMetaMixin(metaInfo)],
  computed: {
    ...mapState({
      helper: state => state.main.loggedUser,
      customer: state => state.customer.customer,
    }),
  },
  async created () {
    if (!this.customer) await this.refreshCustomer();
  },
  methods: {
    async refreshCustomer () {
      try {
        const customer = await Customers.getById(this.helper.customers[0]);
        this.$store.dispatch('customer/setCustomer', customer);
      } catch (e) {
        console.error(e);
        this.customer = {};
      }
    },
  },
};
</script>
