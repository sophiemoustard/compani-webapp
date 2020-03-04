<template>
  <q-page padding class="neutral-background">
    <ni-profile-billing v-if="customer" />
  </q-page>
</template>

<script>
import ProfileBilling from 'src/modules/client/components/customers/ProfileBilling.vue';

import Customers from '@api/Customers';

export default {
  name: 'Billing',
  metaInfo: { title: 'Facturation' },
  components: {
    'ni-profile-billing': ProfileBilling,
  },
  computed: {
    helper () {
      return this.$store.getters['current/user'];
    },
    customer () {
      return this.$store.getters['rh/getUserProfile'];
    },
  },
  async mounted () {
    if (!this.customer) {
      await this.refreshCustomer();
    }
  },
  methods: {
    async refreshCustomer () {
      try {
        const customer = await Customers.getById(this.helper.customers[0]._id);
        this.$store.commit('rh/saveUserProfile', customer);
      } catch (e) {
        console.error(e);
        this.customer = {};
      }
    },
  },
}
</script>
