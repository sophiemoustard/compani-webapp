<template>
  <q-page padding class="vendor-background">
    <div v-if="userProfile">
      <ni-profile-header :title="userIdentity" :header-info="headerInfo">
        <template #title>
          <ni-button color="primary" icon="add" v-if="!userProfile.company" class="q-ml-sm"
            label="Rattacher à une structure" @click="openCompanyLinkModal" />
        </template>
      </ni-profile-header>
      <profile-tabs :profile-id="learnerId" :tabs-content="tabsContent" />
    </div>

    <company-link-modal v-model="companyLinkModal" :loading="modalLoading" @submit="linkUserToCompany"
      :validations="v$.newCompany" @hide="resetCompanyLinkModal" v-model:new-company="newCompany"
      :company-options="companyOptions" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { mapState } from 'vuex';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import get from 'lodash/get';
import Button from '@components/Button';
import Companies from '@api/Companies';
import Users from '@api/Users';
import ProfileHeader from '@components/ProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import ProfileInfo from '@components/learners/ProfileInfo';
import ProfileCourses from '@components/learners/ProfileCourses';
import { formatIdentity, formatAndSortOptions } from '@helpers/utils';
import { ROLE_TRANSLATION } from '@data/constants';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import CompanyLinkModal from 'src/modules/vendor/components/companies/CompanyLinkModal';

export default {
  name: 'LearnerProfile',
  props: {
    learnerId: { type: String, required: true },
    defaultTab: { type: String, default: 'info' },
  },
  setup () {
    const metaInfo = { title: 'Fiche apprenant' };
    useMeta(metaInfo);

    return {
      // Validations
      v$: useVuelidate(),
    };
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'profile-tabs': ProfileTabs,
    'ni-button': Button,
    'company-link-modal': CompanyLinkModal,
  },
  data () {
    return {
      userIdentity: '',
      tabsContent: [
        { label: 'Infos personnelles', name: 'info', default: this.defaultTab === 'info', component: ProfileInfo },
        { label: 'Formations', name: 'courses', default: this.defaultTab === 'courses', component: ProfileCourses },
      ],
      companyOptions: [],
      companyLinkModal: false,
      newCompany: '',
      modalLoading: false,
    };
  },
  async created () {
    await this.$store.dispatch('userProfile/fetchUserProfile', { userId: this.learnerId });
    this.userIdentity = formatIdentity(get(this, 'userProfile.identity'), 'FL');
  },
  watch: {
    async userProfile () {
      this.userIdentity = formatIdentity(get(this, 'userProfile.identity'), 'FL');
    },
  },
  validations () {
    return {
      newCompany: { required },
    };
  },
  computed: {
    ...mapState('userProfile', ['userProfile']),
    userProfileRole () {
      return get(this.userProfile, 'role.client.name') || get(this.userProfile, 'role.vendor.name') || '';
    },
    headerInfo () {
      const infos = [{ icon: 'apartment', label: this.userProfile.company ? this.userProfile.company.name : 'N/A' }];
      if (this.userProfileRole) infos.push({ icon: 'person', label: ROLE_TRANSLATION[this.userProfileRole] });

      return infos;
    },
  },
  methods: {
    async refreshUserProfile () {
      try {
        await this.$store.dispatch('userProfile/fetchUserProfile', { userId: this.userProfile._id });
      } catch (e) {
        console.error(e);
      }
    },
    async openCompanyLinkModal () {
      try {
        const companies = await Companies.list();

        this.companyOptions = formatAndSortOptions(companies, 'name');
        this.companyLinkModal = true;
      } catch (e) {
        console.error(e);
        this.companyLinkModal = false;
        this.companyOptions = [];
      }
    },
    resetCompanyLinkModal () {
      this.companyOptions = [];
      this.newCompany = '';
      this.v$.newCompany.$reset();
    },
    async linkUserToCompany () {
      try {
        this.v$.newCompany.$touch();
        if (this.v$.newCompany.$error) return NotifyWarning('Une structure est requise.');

        this.modalLoading = true;
        await Users.updateById(this.userProfile._id, { company: this.newCompany });

        this.companyLinkModal = false;
        NotifyPositive('Rattachement à la structure effectué.');

        await this.refreshUserProfile();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du rattachement à la structure.');
      } finally {
        this.modalLoading = false;
      }
    },
  },
  beforeUnmount () {
    this.$store.dispatch('userProfile/resetUserProfile');
  },
};
</script>
