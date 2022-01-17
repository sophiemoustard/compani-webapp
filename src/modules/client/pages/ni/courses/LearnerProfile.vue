<template>
  <q-page padding class="client-background">
    <div v-if="userProfile">
      <ni-profile-header :title="userIdentity" :header-info="headerInfo" />
      <profile-tabs :profile-id="learnerId" :tabs-content="tabsContent" />
    </div>
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import get from 'lodash/get';
import ProfileHeader from '@components/ProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import ProfileInfo from '@components/learners/ProfileInfo';
import ProfileCourses from '@components/learners/ProfileCourses';
import { formatIdentity } from '@helpers/utils';
import { ROLE_TRANSLATION } from '@data/constants';

export default {
  name: 'LearnerProfile',
  props: {
    learnerId: { type: String, required: true },
    defaultTab: { type: String, default: 'info' },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'profile-tabs': ProfileTabs,
  },
  setup (props) {
    const metaInfo = { title: 'Fiche apprenant' };
    useMeta(metaInfo);

    const userIdentity = ref('');
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

    watch(userProfile, () => { userIdentity.value = formatIdentity(get(userProfile.value, 'identity'), 'FL'); });

    onBeforeUnmount(() => { $store.dispatch('userProfile/resetUserProfile'); });

    const created = async () => {
      await $store.dispatch('userProfile/fetchUserProfile', { userId: props.learnerId });
      userIdentity.value = formatIdentity(get(userProfile.value, 'identity'), 'FL');
    };

    created();

    return {
      // Data
      userIdentity,
      tabsContent,
      // Computed
      userProfile,
      userProfileRole,
      headerInfo,
    };
  },
};
</script>
