<template>
  <q-page padding class="client-background">
    <div v-if="userProfile">
      <ni-profile-header :title="userIdentity" :header-info="headerInfo">
        <template #title>
          <ni-button v-if="canDetachFromCompany" color="primary" icon="add" class="q-ml-sm"
            label="Détacher de la structure" @click="openCompanyDetachModal" />
        </template>
      </ni-profile-header>
      <profile-tabs :profile-id="learnerId" :tabs-content="tabsContent" />
    </div>
  </q-page>

  <ni-company-detach-modal v-model="companyDetachModal" :user-identity="userIdentity" :loading="detachModalLoading"
    :company-name="companyName" v-model:detachment-date="detachmentDate" @submit="validateCompanyDetachement"
    @hide="resetDetachmentModal" :min-detachment-date="minDetachmentDate"
    :validations="detachmentValidations.detachmentDate" />
</template>

<script>
import { useMeta } from 'quasar';
import { computed, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import get from 'lodash/get';
import ProfileHeader from '@components/ProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import ProfileInfo from '@components/learners/ProfileInfo';
import ProfileCourses from '@components/learners/ProfileCourses';
import Button from '@components/Button';
import CompanyDetachModal from '@components/learners/CompanyDetachModal';
import { formatIdentity } from '@helpers/utils';
import { ROLE_TRANSLATION } from '@data/constants';
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
    'ni-company-detach-modal': CompanyDetachModal,
  },
  setup (props) {
    const metaInfo = { title: 'Fiche apprenant' };
    useMeta(metaInfo);

    const tabsContent = [
      { label: 'Infos personnelles', name: 'info', default: props.defaultTab === 'info', component: ProfileInfo },
      { label: 'Formations', name: 'courses', default: props.defaultTab === 'courses', component: ProfileCourses },
    ];

    const $store = useStore();
    const userProfile = computed(() => $store.state.userProfile.userProfile);
    const userProfileRole = computed(() => get(userProfile.value, 'role.client.name') || '');
    const headerInfo = computed(() => {
      const infos = [{ icon: 'apartment', label: get(userProfile.value, 'company.name') || '' }];
      if (userProfileRole.value) infos.push({ icon: 'person', label: ROLE_TRANSLATION[userProfileRole.value] });

      return infos;
    });

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
      openCompanyDetachModal,
      userIdentity,
      companyName,
      canDetachFromCompany,
      minDetachmentDate,
      detachmentValidations,
      validateCompanyDetachement,
      resetDetachmentModal,
    } = useCompanyDetachment(userProfile, refreshUserProfile);

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
      companyDetachModal,
      detachmentDate,
      detachModalLoading,
      companyName,
      // Validations
      detachmentValidations,
      // Computed
      userProfile,
      userProfileRole,
      headerInfo,
      canDetachFromCompany,
      minDetachmentDate,
      // Methods
      get,
      openCompanyDetachModal,
      validateCompanyDetachement,
      resetDetachmentModal,
    };
  },
};
</script>
