<template>
  <q-page padding class="vendor-background">
    <div v-if="userProfile">
      <ni-profile-header :title="userIdentity" />
      <profile-tabs :profile-id="trainerId" :tabsContent="tabsContent" />
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import get from 'lodash/get';
import ProfileHeader from 'src/modules/vendor/components/ProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
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
      userIdentity: '',
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
  async created () {
    await this.$store.dispatch('rh/fetchUserProfile', { userId: this.trainerId });
    this.userIdentity = formatIdentity(get(this, 'userProfile.identity'), 'FL');
  },
  computed: {
    ...mapState('rh', ['userProfile']),
  },
  watch: {
    async userProfile () {
      this.userIdentity = formatIdentity(get(this, 'userProfile.identity'), 'FL');
      await this.$store.dispatch('rh/updateNotifications');
    },
  },
  beforeDestroy () {
    this.$store.dispatch('rh/resetRh');
  },
}
</script>
