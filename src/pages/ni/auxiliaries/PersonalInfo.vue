<template>
  <q-page padding class="neutral-background">
    <div v-if="userProfile">
      <profile-header :profileId="id" class="header" />
      <profile-tabs :profileId="id" :tabsContent="tabsContent" />
    </div>
  </q-page>
</template>

<script>

import ProfileHeader from '../../../components/ProfileHeader';
import ProfileTabs from '../../../components/ProfileTabs';
import ProfileInfo from '../../../components/auxiliary/ProfileInfo';
// import ProfileTasks from '../../../components/auxiliary/ProfileTasks';
// import ProfileContracts from '../../../components/auxiliary/ProfileContracts';
// import ProfilePay from '../../../components/auxiliary/ProfilePay';

export default {
  props: {
    id: { type: String },
    defaultTab: { type: String, default: 'info' },
  },
  components: {
    ProfileHeader,
    ProfileTabs,
  },
  name: 'PersonalInfo',
  metaInfo: {
    title: 'Infos personnelles',
  },
  computed: {
    userProfile () {
      return this.$store.getters['rh/getUserProfile'];
    },
    currentUser () {
      return this.$store.getters['main/user'];
    },
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
          // component: ProfileTasks,
          notification: 'tasks',
        },
        {
          label: 'Contrats',
          name: 'contracts',
          default: this.defaultTab === 'contracts',
          // component: ProfileContracts,
        },
        {
          label: 'Paie',
          name: 'pays',
          default: this.defaultTab === 'pays',
          // component: ProfilePay,
        },
      ],
    }
  },
  async mounted () {
    await this.$store.dispatch('rh/getUserProfile', { userId: this.id });
  },
  watch: {
    async userProfile () {
      await this.$store.dispatch('rh/updateNotifications', 'user');
    },
  },
  beforeDestroy () {
    this.$store.commit('rh/saveUserProfile', null);
  },
}
</script>
