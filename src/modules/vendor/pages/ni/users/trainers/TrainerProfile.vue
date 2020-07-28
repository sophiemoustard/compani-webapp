<template>
  <q-page padding class="vendor-background">
    <div v-if="userProfile">
      <ni-profile-header :title="userIdentity" />
      <profile-tabs :profile-id="trainerId" :tabsContent="tabsContent" />
    </div>
  </q-page>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import get from 'lodash/get';
import ProfileHeader from 'src/modules/vendor/components/ProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import ProfileInfo from 'src/modules/vendor/components/trainers/ProfileInfo';
import { formatIdentity } from '@helpers/utils';
import { TRAINER } from '@data/constants';

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
    if (this.vendorRole !== TRAINER) await this.$store.dispatch('rh/fetchUserProfile', { userId: this.trainerId });
    this.userIdentity = formatIdentity(get(this, 'userProfile.identity'), 'FL');
  },
  computed: {
    ...mapState({
      userProfile: state => TRAINER === get(state.main.loggedUser, 'role.vendor.name')
        ? state.main.loggedUser
        : state.rh.userProfile,
    }),
    ...mapGetters({ vendorRole: 'main/getVendorRole' }),
  },
  watch: {
    async userProfile () {
      this.userIdentity = formatIdentity(get(this, 'userProfile.identity'), 'FL');
      if (this.vendorRole !== TRAINER) await this.$store.dispatch('rh/updateNotifications');
    },
  },
  beforeDestroy () {
    this.$store.dispatch('rh/resetRh');
  },
}
</script>
