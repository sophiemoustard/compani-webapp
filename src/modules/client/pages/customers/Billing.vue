<template>
  <q-page padding class="client-background">
    <h4>Facturation</h4>
    <ni-profile-billing v-if="customer" />
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import ProfileBilling from 'src/modules/client/components/customers/billing/ProfileBilling.vue';
import Customers from '@api/Customers';

export default {
  name: 'Billing',
  metaInfo: { title: 'Facturation' },
  components: {
    'ni-profile-billing': ProfileBilling,
  },
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
