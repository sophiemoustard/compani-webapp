<template>
  <q-page padding class="vendor-background">
    <div v-if="userProfile">
      <ni-profile-header :title="userIdentity">
        <template v-slot:body>
          <div class="row profile-info q-pl-lg">
            <q-item v-for="info of headerInfo" class="col-md-6 col-xs-12" :key="info.icon">
              <q-item-section side><q-icon size="xs" :name="info.icon" /></q-item-section>
              <q-item-section>{{ info.label }}</q-item-section>
            </q-item>
          </div>
        </template>
      </ni-profile-header>
      <profile-tabs :profile-id="learnerId" :tabs-content="tabsContent" />
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import get from 'lodash/get';
import ProfileHeader from 'src/modules/vendor/components/ProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import ProfileInfo from 'src/modules/vendor/components/learners/ProfileInfo';
import ProfileCourses from 'src/modules/vendor/components/learners/ProfileCourses';
import { formatIdentity } from '@helpers/utils';
import {
  AUXILIARY,
  HELPER,
  COACH,
  PLANNING_REFERENT,
  AUXILIARY_WITHOUT_COMPANY,
  CLIENT_ADMIN,
  VENDOR_ADMIN,
  TRAINING_ORGANISATION_MANAGER,
  TRAINER,
} from '@data/constants';

export default {
  name: 'LearnerProfile',
  metaInfo: { title: 'Fiche apprenant' },
  props: {
    learnerId: { type: String, required: true },
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
      return get(this.userProfile, 'role.client.name') || get(this.userProfile, 'role.vendor.name') || '';
    },
    headerInfo () {
      const infos = [{ icon: 'apartment', label: this.userProfile.company ? this.userProfile.company.name : 'N/A' }];
      if (this.userProfileRole) infos.push({ icon: 'person', label: this.getRoleLabel(this.userProfileRole) });

      return infos;
    },
  },
  watch: {
    async userProfile () {
      this.userIdentity = formatIdentity(get(this, 'userProfile.identity'), 'FL');
    },
  },
  methods: {
    getRoleLabel (role) {
      switch (role) {
        case HELPER:
          return 'Aidant';
        case AUXILIARY:
        case PLANNING_REFERENT:
        case AUXILIARY_WITHOUT_COMPANY:
          return 'Auxiliaire';
        case CLIENT_ADMIN:
          return 'Administateur';
        case VENDOR_ADMIN:
          return 'Administateur Vendeur';
        case COACH:
          return 'Coach';
        case TRAINING_ORGANISATION_MANAGER:
          return 'Responsable Formation';
        case TRAINER:
          return 'Formateur';
        default:
          return '';
      }
    },
  },
  beforeDestroy () {
    this.$store.dispatch('userProfile/resetUserProfile');
  },
};
</script>
