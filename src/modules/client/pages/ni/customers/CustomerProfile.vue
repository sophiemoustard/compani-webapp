<template>
  <q-page padding class="client-background">
    <div v-if="customer">
      <customer-profile-header :profile-id="customerId" :title="customerName" />
      <profile-tabs :profile-id="customerId" :tabs-content="tabsContent" :notifications="notifications" />
    </div>
  </q-page>
</template>

<script>
import { createMetaMixin } from 'quasar';
import { shallowRef } from 'vue';
import { mapState } from 'vuex';
import CustomerProfileHeader from 'src/modules/client/components/customers/CustomerProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import ProfileFollowUp from 'src/modules/client/components/customers/ProfileFollowUp';
import ProfileInfo from 'src/modules/client/components/customers/infos/ProfileInfo';
import ProfileBilling from 'src/modules/client/components/customers/billing/ProfileBilling';

const metaInfo = { title: 'Fiche bénéficiaire' };

export default {
  props: {
    customerId: { type: String, required: true },
    defaultTab: { type: String, default: () => 'followUp' },
  },
  components: {
    CustomerProfileHeader,
    ProfileTabs,
  },
  mixins: [createMetaMixin(metaInfo)],
  data () {
    return {
      tabsContent: [
        {
          label: 'Accompagnement',
          name: 'followUp',
          default: this.defaultTab === 'followUp',
          component: shallowRef(ProfileFollowUp),
        },
        {
          label: 'Infos',
          name: 'info',
          default: this.defaultTab === 'info',
          component: shallowRef(ProfileInfo),
          notification: 'profiles',
        },
        {
          label: 'Facturation',
          name: 'billing',
          default: this.defaultTab === 'billing',
          component: shallowRef(ProfileBilling),
        },
      ],
      customerName: '',
    };
  },
  async mounted () {
    await this.$store.dispatch('customer/fetchCustomer', { customerId: this.customerId });
    this.refreshCustomerName();
  },
  computed: {
    ...mapState('customer', ['customer', 'notifications']),
  },
  watch: {
    async customer () {
      await this.$store.dispatch('customer/updateNotifications');
      this.refreshCustomerName();
    },
  },
  methods: {
    refreshCustomerName () {
      this.customerName = this.customer.identity
        ? `${this.customer.identity.firstname} ${this.customer.identity.lastname}`
        : '';
    },
  },
  beforeUnmount () {
    this.$store.dispatch('customer/resetCustomer');
  },
};
</script>
