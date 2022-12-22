<template>
  <q-page padding class="vendor-background">
    <div v-if="userProfile">
      <ni-profile-header :title="userIdentity" :header-info="headerInfo">
        <template #title>
          <ni-button color="primary" icon="add" v-if="canLinkToCompany" class="q-ml-sm"
            label="Rattacher à une structure" @click="openCompanyLinkModal" />
          <ni-button v-else-if="canDetachFromCompany" icon="person_remove" class="q-ml-sm"
            label="Détacher de la structure" @click="openCompanyDetachModal" />
        </template>
      </ni-profile-header>
      <profile-tabs :profile-id="learnerId" :tabs-content="tabsContent" />
    </div>

    <company-link-modal v-model="companyLinkModal" :loading="modalLoading" @submit="linkUserToCompany"
      :validations="v$.newCompanyLink" @hide="resetCompanyLinkModal" v-model:new-company-link="newCompanyLink"
      :company-options="companyOptions" />

    <ni-company-detach-modal v-model="companyDetachModal" :user-identity="userIdentity" :loading="detachModalLoading"
      :company-name="companyName" v-model:detachment-date="detachmentDate" @submit="validateCompanyDetachement"
      @hide="resetDetachmentModal" :min-detachment-date="minDetachmentDate" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { ref, computed, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
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
import CompaniDate from '@helpers/dates/companiDates';
import CompanyDetachModal from '@components/learners/CompanyDetachModal';
import { formatIdentity, formatAndSortOptions } from '@helpers/utils';
import { ROLE_TRANSLATION, DAY } from '@data/constants';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import CompanyLinkModal from 'src/modules/vendor/components/companies/CompanyLinkModal';
import { useCompanyDetachment } from '@composables/companyDetachment';

export default {
  name: 'LearnerProfile',
  props: {
    learnerId: { type: String, required: true },
    defaultTab: { type: String, default: 'info' },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'profile-tabs': ProfileTabs,
    'ni-button': Button,
    'company-link-modal': CompanyLinkModal,
    'ni-company-detach-modal': CompanyDetachModal,
  },
  setup (props) {
    const metaInfo = { title: 'Fiche apprenant' };
    useMeta(metaInfo);

    const tabsContent = [
      { label: 'Infos personnelles', name: 'info', default: props.defaultTab === 'info', component: ProfileInfo },
      { label: 'Formations', name: 'courses', default: props.defaultTab === 'courses', component: ProfileCourses },
    ];
    const companyOptions = ref([]);
    const companyLinkModal = ref(false);
    const newCompanyLink = ref({ company: '', startDate: CompaniDate().startOf(DAY).toISO() });
    const modalLoading = ref(false);

    const $store = useStore();
    const userProfile = computed(() => $store.state.userProfile.userProfile);

    const userProfileRole = computed(() => get(userProfile.value, 'role.client.name') ||
      get(userProfile.value, 'role.vendor.name') || '');

    const refreshUserProfile = async () => {
      try {
        await $store.dispatch('userProfile/fetchUserProfile', { userId: props.learnerId });
      } catch (e) {
        console.error(e);
      }
    };

    const {
      companyDetachModal,
      detachmentDate,
      detachModalLoading,
      companyName,
      openCompanyDetachModal,
      userIdentity,
      canDetachFromCompany,
      canLinkToCompany,
      minDetachmentDate,
      validateCompanyDetachement,
      resetDetachmentModal,
    } = useCompanyDetachment(userProfile, refreshUserProfile);

    const headerInfo = computed(() => {
      const infos = [{ icon: 'apartment', label: companyName.value || 'N/A' }];
      if (userProfileRole.value) infos.push({ icon: 'person', label: ROLE_TRANSLATION[userProfileRole.value] });

      return infos;
    });

    const rules = {
      newCompanyLink: { company: { required }, startDate: { required } },
    };
    const v$ = useVuelidate(rules, { newCompanyLink });

    const openCompanyLinkModal = async () => {
      try {
        const companies = await Companies.list();

        companyOptions.value = formatAndSortOptions(companies, 'name');
        companyLinkModal.value = true;
      } catch (e) {
        console.error(e);
        companyLinkModal.value = false;
        companyOptions.value = [];
      }
    };

    const resetCompanyLinkModal = () => {
      companyOptions.value = [];
      newCompanyLink.value = { company: '', startDate: CompaniDate().startOf(DAY).toISO() };
      v$.value.newCompanyLink.$reset();
    };

    const linkUserToCompany = async () => {
      try {
        v$.value.newCompanyLink.$touch();
        if (v$.value.newCompanyLink.$error) return NotifyWarning('Une structure est requise.');

        modalLoading.value = true;
        await Users.updateById(
          userProfile.value._id,
          { company: newCompanyLink.value.company, userCompanyStartDate: newCompanyLink.value.startDate }
        );

        companyLinkModal.value = false;
        NotifyPositive('Rattachement à la structure effectué.');

        await refreshUserProfile();
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors du rattachement à la structure.');
      } finally {
        modalLoading.value = false;
      }
    };

    onBeforeUnmount(() => { $store.dispatch('userProfile/resetUserProfile'); });

    const created = async () => {
      await refreshUserProfile();
      userIdentity.value = formatIdentity(get(userProfile.value, 'identity'), 'FL');
    };

    created();

    return {
      // Data
      userIdentity,
      tabsContent,
      companyOptions,
      companyLinkModal,
      newCompanyLink,
      modalLoading,
      companyDetachModal,
      detachmentDate,
      detachModalLoading,
      // Computed
      companyName,
      userProfile,
      headerInfo,
      canDetachFromCompany,
      canLinkToCompany,
      minDetachmentDate,
      // Validations
      v$,
      // Methods
      get,
      openCompanyLinkModal,
      resetCompanyLinkModal,
      linkUserToCompany,
      openCompanyDetachModal,
      validateCompanyDetachement,
      resetDetachmentModal,
    };
  },
};
</script>
