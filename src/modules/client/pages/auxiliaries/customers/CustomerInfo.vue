<template>
  <q-page padding class="client-background">
    <div v-if="customer">
      <div class="row items-center col-xs-12 header-margin q-mb-xl">
        <ni-button class="on-left self-center" icon="arrow_back" color="primary" @click="$router.go(-1)" />
        <ni-title-header :title="customer.identity | formatIdentity('FL')" />
      </div>
      <profile-follow-up />
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import { formatIdentity } from '@helpers/utils';
import Button from '@components/Button';
import TitleHeader from '@components/TitleHeader';
import ProfileFollowUp from 'src/modules/client/components/customers/ProfileFollowUp';

export default {
  components: {
    'ni-title-header': TitleHeader,
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
  beforeUnmount () {
    this.$store.dispatch('customer/resetCustomer');
  },
};
</script>
