<template>
  <q-page padding class="vendor-background">
    <div v-if="userProfile">
      <ni-profile-header :title="userIdentity" />
      <profile-tabs :profile-id="trainerId" :tabs-content="tabsContent" />
    </div>
  </q-page>
</template>

<script>
import { createMetaMixin } from 'quasar';
import { mapState, mapGetters } from 'vuex';
import get from 'lodash/get';
import ProfileHeader from '@components/ProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import ProfileInfo from 'src/modules/vendor/components/trainers/ProfileInfo';
import { formatIdentity } from '@helpers/utils';
import { TRAINER } from '@data/constants';

const metaInfo = { title: 'Fiche formateur' };

export default {
  name: 'TrainerProfile',
  props: {
    trainerId: { type: String, required: true },
    defaultTab: { type: String, default: 'info' },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'profile-tabs': ProfileTabs,
  },
  mixins: [createMetaMixin(metaInfo)],
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
    };
  },
  async created () {
    if (this.vendorRole !== TRAINER) {
      await this.$store.dispatch('userProfile/fetchUserProfile', { userId: this.trainerId });
    }
    this.userIdentity = formatIdentity(get(this.userProfile, 'identity'), 'FL');
  },
  computed: {
    ...mapState({
      userProfile: state => (TRAINER === get(state.main.loggedUser, 'role.vendor.name')
        ? state.main.loggedUser
        : state.userProfile.userProfile),
    }),
    ...mapGetters({ vendorRole: 'main/getVendorRole' }),
  },
  watch: {
    async userProfile () {
      this.userIdentity = formatIdentity(get(this.userProfile, 'identity'), 'FL');
      if (this.vendorRole !== TRAINER) await this.$store.dispatch('userProfile/updateNotifications');
    },
  },
  beforeUnmount () {
    this.$store.dispatch('userProfile/resetUserProfile');
  },
};
</script>
