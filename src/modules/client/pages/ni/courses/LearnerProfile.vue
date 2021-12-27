<template>
  <q-page padding class="client-background">
    <div v-if="userProfile">
      <ni-profile-header :title="userIdentity" :header-info="headerInfo" />
      <profile-tabs :profile-id="learnerId" :tabs-content="tabsContent" />
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import get from 'lodash/get';
import ProfileHeader from '@components/ProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import ProfileInfo from '@components/learners/ProfileInfo';
import ProfileCourses from '@components/learners/ProfileCourses';
import { formatIdentity } from '@helpers/utils';
import { learnerMixin } from '@mixins/learnerMixin';

export default {
  name: 'LearnerProfile',
  metaInfo: { title: 'Fiche apprenant' },
  props: {
    learnerId: { type: String, required: true },
    defaultTab: { type: String, default: 'info' },
  },
  mixins: [learnerMixin],
  components: {
    'ni-profile-header': ProfileHeader,
    'profile-tabs': ProfileTabs,
  },
  data () {
    return {
      userIdentity: '',
      tabsContent: [
        { label: 'Infos personnelles', name: 'info', default: this.defaultTab === 'info', component: ProfileInfo },
        { label: 'Formations', name: 'courses', default: this.defaultTab === 'courses', component: ProfileCourses },
      ],
    };
  },
  async created () {
    await this.$store.dispatch('userProfile/fetchUserProfile', { userId: this.learnerId });
    this.userIdentity = formatIdentity(get(this, 'userProfile.identity'), 'FL');
  },
  computed: {
    ...mapState('userProfile', ['userProfile']),
    userProfileRole () {
      return get(this.userProfile, 'role.client.name') || '';
    },
    headerInfo () {
      const infos = [{ icon: 'apartment', label: get(this.userProfile, 'company.name') || '' }];
      if (this.userProfileRole) infos.push({ icon: 'person', label: this.getRoleLabel(this.userProfileRole) });

      return infos;
    },
  },
  watch: {
    async userProfile () {
      this.userIdentity = formatIdentity(get(this, 'userProfile.identity'), 'FL');
    },
  },
  beforeUnmount () {
    this.$store.dispatch('userProfile/resetUserProfile');
  },
};
</script>
