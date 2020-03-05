<template>
  <q-page padding class="neutral-background">
    <div v-if="userProfile">
      <customer-profile-header :profileId="customerId" class="header" />
      <profile-tabs :profileId="customerId" :tabsContent="tabsContent" type="customer" />
    </div>
  </q-page>
</template>

<script>
import CustomerProfileHeader from 'src/modules/client/components/customers/CustomerProfileHeader';
import ProfileTabs from 'src/modules/client/components/ProfileTabs';
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
    userProfile () {
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
    async userProfile () {
      await this.$store.dispatch('customer/updateNotifications');
    },
  },
  beforeDestroy () {
    this.$store.commit('customer/saveCustomer', null);
  },
}
</script>

<style lang="stylus" scoped>
  .header-margin
    margin-bottom: 60px
    @media (max-width: 768px)
      margin-bottom: 40px
</style>
