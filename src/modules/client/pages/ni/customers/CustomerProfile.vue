<template>
  <q-page padding class="client-background">
    <div v-if="customer">
      <customer-profile-header :profile-id="customerId" :title="customerName" />
      <profile-tabs :profile-id="customerId" :tabs-content="tabsContent" :notifications="notifications" />
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import CustomerProfileHeader from 'src/modules/client/components/customers/CustomerProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import ProfileFollowUp from 'src/modules/client/components/customers/ProfileFollowUp';
import ProfileInfo from 'src/modules/client/components/customers/infos/ProfileInfo';
import ProfileBilling from 'src/modules/client/components/customers/billing/ProfileBilling';

export default {
  props: {
    customerId: { type: String, required: true },
    defaultTab: { type: String, default: () => 'followUp' },
  },
  components: {
    CustomerProfileHeader,
    ProfileTabs,
  },
  metaInfo: { title: 'Fiche bénéficiaire' },
  data () {
    return {
      tabsContent: [
        {
          label: 'Accompagnement',
          name: 'followUp',
          default: this.defaultTab === 'followUp',
          component: ProfileFollowUp,
        },
        {
          label: 'Infos',
          name: 'info',
          default: this.defaultTab === 'info',
          component: ProfileInfo,
          notification: 'profiles',
        },
        {
          label: 'Facturation',
          name: 'billing',
          default: this.defaultTab === 'billing',
          component: ProfileBilling,
        },
      ],
      customerName: '',
    };
  },
  async mounted () {
    await this.$store.dispatch('customer/fetchCustomer', { customerId: this.customerId });
    this.customerName = this.customer.identity
      ? `${this.customer.identity.firstname} ${this.customer.identity.lastname}`
      : '';
  },
  computed: {
    ...mapState('customer', ['customer', 'notifications']),
  },
  watch: {
    async customer () {
      await this.$store.dispatch('customer/updateNotifications');
      this.customerName = this.customer.identity
        ? `${this.customer.identity.firstname} ${this.customer.identity.lastname}`
        : '';
    },
  },
  beforeDestroy () {
    this.$store.dispatch('customer/resetCustomer');
  },
};
</script>
