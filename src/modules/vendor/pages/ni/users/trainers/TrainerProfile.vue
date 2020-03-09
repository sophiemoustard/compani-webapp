<template>
  <q-page padding class="neutral-background">
    <div v-if="userProfile">
      <ni-profile-header :title="userIdentity" />
      <profile-tabs :profile-id="trainerId" :tabsContent="tabsContent" />
    </div>
  </q-page>
</template>

<script>
import get from 'lodash/get';
import ProfileHeader from 'src/modules/vendor/components/ProfileHeader';
import ProfileTabs from 'src/modules/client/components/ProfileTabs';
import ProfileInfo from 'src/modules/vendor/components/trainers/ProfileInfo';
import { formatIdentity } from '@helpers/utils';

export default {
  name: 'TrainerProfile',
  metaInfo: { title: 'Fiche formateurs' },
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
      tabsContent: [
        {
          label: 'Infos personnelles',
          name: 'info',
          default: this.defaultTab === 'info',
          component: ProfileInfo,
          notification: 'profiles',
        },
      ],
    }
  },
  async mounted () {
    await this.$store.dispatch('rh/getUserProfile', { userId: this.trainerId });
  },
  computed: {
    userProfile () {
      return this.$store.getters['rh/getUserProfile'];
    },
    userIdentity () {
      return formatIdentity(get(this, 'userProfile.identity'), 'FL');
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
