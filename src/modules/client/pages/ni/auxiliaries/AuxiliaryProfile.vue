<template>
  <q-page padding class="client-background">
    <div v-if="userProfile">
      <auxiliary-profile-header :profile-id="auxiliaryId" />
      <profile-tabs :profile-id="auxiliaryId" :tabsContent="tabsContent" type="auxiliary" />
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import AuxiliaryProfileHeader from 'src/modules/client/components/auxiliary/AuxiliaryProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import ProfileInfo from 'src/modules/client/components/auxiliary/ProfileInfo';
import ProfileTasks from 'src/modules/client/components/auxiliary/ProfileTasks';
import ProfileContracts from 'src/modules/client/components/auxiliary/ProfileContracts';
import ProfilePay from 'src/modules/client/components/auxiliary/ProfilePay';

export default {
  props: {
    auxiliaryId: { type: String },
    defaultTab: { type: String, default: 'info' },
  },
  components: {
    'auxiliary-profile-header': AuxiliaryProfileHeader,
    'profile-tabs': ProfileTabs,
  },
  name: 'AuxiliaryProfile',
  metaInfo: { title: 'Fiche auxiliaire' },
  computed: {
    ...mapState('rh', ['userProfile']),
  },
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
        {
          label: 'Tâches',
          name: 'tasks',
          default: this.defaultTab === 'tasks',
          component: ProfileTasks,
          notification: 'tasks',
        },
        {
          label: 'Contrats',
          name: 'contracts',
          default: this.defaultTab === 'contracts',
          component: ProfileContracts,
        },
        {
          label: 'Paie',
          name: 'pays',
          default: this.defaultTab === 'pays',
          component: ProfilePay,
        },
      ],
    }
  },
  async created () {
    await this.$store.dispatch('rh/getUserProfile', { userId: this.auxiliaryId });
  },
  watch: {
    async userProfile () {
      await this.$store.dispatch('rh/updateNotifications');
    },
  },
  beforeDestroy () {
    this.$store.dispatch('rh/resetUserProfile');
  },
}
</script>
