<template>
  <q-page padding class="neutral-background">
    <ni-profile-header :title="userIdentity" />
    <profile-tabs :profile-id="trainerId" :tabsContent="tabsContent" />
  </q-page>
</template>

<script>
import ProfileHeader from 'src/modules/vendor/components/ProfileHeader';
import ProfileTabs from 'src/modules/client/components/ProfileTabs';
import ProfileInfo from 'src/modules/vendor/components/trainers/ProfileInfo';
import { formatIdentity } from '@helpers/utils';

export default {
  name: 'TrainerProfile',
  metadata: { title: 'Fiche formation' },
  props: {
    trainerId: { type: String },
    defaultTab: { type: String, default: 'info' },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'profile-tabs': ProfileTabs,
  },
  data () {
    return {
      trainer: {},
      tabsContent: [
        {
          label: 'Infos personnelles',
          name: 'info',
          default: this.defaultTab === 'info',
          component: ProfileInfo,
        },
      ],
    }
  },
  async mounted () {
    await this.refreshTrainer();
  },
  computed: {
    userProfile () {
      return this.$store.getters['rh/getUserProfile'];
    },
    userIdentity () {
      if (this.userProfile) return formatIdentity(this.userProfile.identity, 'FL');
      return '';
    },
  },
  methods: {
    async refreshTrainer () {
      try {
        await this.$store.dispatch('rh/getUserProfile', { userId: this.trainerId });
      } catch (e) {
        console.error(e);
        this.trainer = {};
      }
    },
  },
  watch: {
    async userProfile () {
      await this.$store.dispatch('rh/updateNotifications');
    },
  },
  beforeDestroy () {
    this.$store.commit('rh/saveUserProfile', null);
  },
}
</script>
