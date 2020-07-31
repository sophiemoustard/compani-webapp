<template>
  <q-page padding class="vendor-background">
    <div v-if="userProfile">
      <ni-profile-header :title="userIdentity">
        <template v-slot:body>
          <div class="row profile-info q-pl-lg">
            <q-item v-for="info of headerInfo" class="col-md-6 col-xs-12" :key="info.icon">
              <q-item-section side><q-icon size="xs" :name="info.icon"/></q-item-section>
              <q-item-section>{{ info.label }}</q-item-section>
            </q-item>
          </div>
        </template>
      </ni-profile-header>
      <profile-tabs :profile-id="learnerId" :tabsContent="tabsContent" />
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import get from 'lodash/get';
import ProfileHeader from 'src/modules/vendor/components/ProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import ProfileInfo from 'src/modules/vendor/components/learners/ProfileInfo';
import { formatIdentity } from '@helpers/utils';

export default {
  name: 'LearnerProfile',
  metaInfo: { title: 'Fiche apprenant' },
  props: {
    learnerId: { type: String },
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
    await this.$store.dispatch('userProfile/fetchUserProfile', { userId: this.learnerId });
    this.userIdentity = formatIdentity(get(this, 'userProfile.identity'), 'FL');
  },
  computed: {
    ...mapState('userProfile', ['userProfile']),
    headerInfo () {
      const infos = [
        { icon: 'library_books', label: this.userProfile.company ? this.userProfile.company.name : 'N/A' },
      ]

      return infos;
    },
  },
  watch: {
    async userProfile () {
      this.userIdentity = formatIdentity(get(this, 'userProfile.identity'), 'FL');
      await this.$store.dispatch('userProfile/updateNotifications');
    },
  },
  beforeDestroy () {
    this.$store.dispatch('userProfile/resetUserProfile');
  },
}
</script>
