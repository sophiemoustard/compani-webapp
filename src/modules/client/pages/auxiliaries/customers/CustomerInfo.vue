<template>
  <q-page padding class="client-background">
    <div v-if="customer">
      <div class="row items-center col-xs-12 header-margin q-mb-xl">
        <q-icon class="on-left cursor-pointer self-center" size="1rem" name="arrow_back" color="primary"
          @click.native="$router.go(-1)" />
        <h4 class="no-margin">{{ customer.identity | formatIdentity('FL') }}</h4>
      </div>
      <profile-follow-up />
    </div>
  </q-page>
</template>

<script>
import { formatIdentity } from '@helpers/utils';
import ProfileFollowUp from 'src/modules/client/components/customers/ProfileFollowUp.vue';

export default {
  components: {
    'profile-follow-up': ProfileFollowUp,
  },
  props: {
    customerId: { type: String },
  },
  metaInfo: { title: 'Fiche bénéficiaire' },
  computed: {
    customer () {
      return this.$store.getters['customer/getCustomer'];
    },
  },
  async mounted () {
    await this.$store.dispatch('customer/getCustomer', { customerId: this.customerId });
  },
  filters: {
    formatIdentity,
  },
  beforeDestroy () {
    this.$store.commit('customer/saveCustomer', null);
  },
}
</script>
