<template>
  <q-page padding class="client-background">
    <div v-if="customer">
      <customer-profile-header :profile-id="customerId" />
      <profile-tabs :profile-id="customerId" :tabsContent="tabsContent" type="customer" />
    </div>
  </q-page>
</template>

<script>
import CustomerProfileHeader from 'src/modules/client/components/customers/CustomerProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import ProfileFollowUp from 'src/modules/client/components/customers/ProfileFollowUp';
import ProfileInfo from 'src/modules/client/components/customers/ProfileInfo';
import ProfileBilling from 'src/modules/client/components/customers/ProfileBilling';

export default {
  props: {
    customerId: { type: String },
    defaultTab: { type: String, default: () => 'followUp' },
  },
  components: {
    CustomerProfileHeader,
    ProfileTabs,
  },
  metaInfo: { title: 'Fiche bénéficiaire' },
  computed: {
    customer () {
      return this.$store.getters['customer/getCustomer'];
    },
  },
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
    }
  },
  async mounted () {
    await this.$store.dispatch('customer/getCustomer', { customerId: this.customerId });
  },
  watch: {
    async customer () {
      await this.$store.dispatch('customer/updateNotifications');
    },
  },
  beforeDestroy () {
    this.$store.commit('customer/saveCustomer', null);
  },
}
</script>
