<template>
  <q-page padding class="client-background">
    <div v-if="customer">
      <div class="row items-center col-xs-12 header-margin q-mb-xl">
        <ni-button class="on-left self-center" icon="arrow_back" color="primary" @click.native="$router.go(-1)"
          size="sm" />
        <h4 class="no-margin">{{ customer.identity | formatIdentity('FL') }}</h4>
      </div>
      <profile-follow-up />
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import { formatIdentity } from '@helpers/utils';
import Button from '@components/Button';
import ProfileFollowUp from 'src/modules/client/components/customers/ProfileFollowUp';

export default {
  components: {
    'ni-button': Button,
    'profile-follow-up': ProfileFollowUp,
  },
  props: {
    customerId: { type: String, required: true },
  },
  metaInfo: { title: 'Fiche bénéficiaire' },
  computed: {
    ...mapState('customer', ['customer']),
  },
  async mounted () {
    await this.$store.dispatch('customer/fetchCustomer', { customerId: this.customerId });
  },
  filters: {
    formatIdentity,
  },
  beforeDestroy () {
    this.$store.dispatch('customer/resetCustomer');
  },
};
</script>
