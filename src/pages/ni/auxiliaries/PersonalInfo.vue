<template>
  <q-page padding class="neutral-background">
    <div v-if="userProfile">
      <profile-header v-if="!isAuxiliary" :profileId="id" class="header" />
      <profile-tabs v-if="!isAuxiliary" :profileId="id" :tabsContent="tabsContent" />
      <h4 v-if="isAuxiliary">Informations personnelles</h4>
      <profile-info v-if="isAuxiliary" />
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
import { AUXILIARY, PLANNING_REFERENT } from '../../../data/constants.js';

export default {
  props: {
    id: { type: String },
    defaultTab: { type: String, default: 'info' },
  },
  components: {
    ProfileHeader,
    ProfileTabs,
    ProfileInfo,
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
    isAuxiliary () {
      return this.currentUser.role.name === AUXILIARY || this.currentUser.role.name === PLANNING_REFERENT;
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
