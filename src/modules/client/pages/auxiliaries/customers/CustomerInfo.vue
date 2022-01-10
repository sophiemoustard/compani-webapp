<template>
  <q-page padding class="client-background">
    <div v-if="customer">
      <div class="row items-center col-xs-12 header-margin q-mb-xl">
        <ni-button class="on-left self-center" icon="arrow_back" color="primary" @click="$router.go(-1)" />
        <ni-title-header :title="formatIdentity(customer.identity, 'FL')" />
      </div>
      <profile-follow-up />
    </div>
  </q-page>
</template>

<script>
import { createMetaMixin } from 'quasar';
import { mapState } from 'vuex';
import { formatIdentity } from '@helpers/utils';
import Button from '@components/Button';
import TitleHeader from '@components/TitleHeader';
import ProfileFollowUp from 'src/modules/client/components/customers/ProfileFollowUp';

const metaInfo = { title: 'Fiche bénéficiaire' };

export default {
  components: {
    'ni-title-header': TitleHeader,
    'ni-button': Button,
    'profile-follow-up': ProfileFollowUp,
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
