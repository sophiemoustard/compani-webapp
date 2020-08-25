<template>
  <q-page padding class="client-background">
    <div v-if="userProfile">
      <auxiliary-profile-header :profile-id="auxiliaryId" />
      <profile-tabs :profile-id="auxiliaryId" :tabs-content="tabsContent" :notifications="notifications" />
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import AuxiliaryProfileHeader from 'src/modules/client/components/auxiliary/AuxiliaryProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import ProfileInfo from 'src/modules/client/components/auxiliary/ProfileInfo';
import ProfileContracts from 'src/modules/client/components/auxiliary/ProfileContracts';
import ProfilePay from 'src/modules/client/components/auxiliary/ProfilePay';

export default {
  props: {
    auxiliaryId: { type: String, required: true },
    defaultTab: { type: String, default: 'info' },
  },
  components: {
    'auxiliary-profile-header': AuxiliaryProfileHeader,
    'profile-tabs': ProfileTabs,
  },
  name: 'AuxiliaryProfile',
  metaInfo: { title: 'Fiche auxiliaire' },
  data () {
    return {
      tabsContent: [
        {
          label: 'Infos personnelles',
          name: 'info',
          default: this.defaultTab === 'info',
          component: ProfileInfo,
          notification: 'profiles',
        },
        { label: 'Contrats', name: 'contracts', default: this.defaultTab === 'contracts', component: ProfileContracts },
        { label: 'Paie', name: 'pays', default: this.defaultTab === 'pays', component: ProfilePay },
      ],
    };
  },
  async created () {
    await this.$store.dispatch('userProfile/fetchUserProfile', { userId: this.auxiliaryId });
  },
  computed: {
    ...mapState('userProfile', ['userProfile', 'notifications']),
  },
  watch: {
    async userProfile () {
      await this.$store.dispatch('userProfile/updateNotifications');
    },
  },
  beforeDestroy () {
    this.$store.dispatch('userProfile/resetUserProfile');
  },
};
</script>
