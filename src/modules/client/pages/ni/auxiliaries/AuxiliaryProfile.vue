<template>
  <q-page padding class="client-background">
    <div v-if="userProfile">
      <auxiliary-profile-header :profile-id="auxiliaryId" :title="auxiliaryName" />
      <profile-tabs :profile-id="auxiliaryId" :tabs-content="tabsContent" :notifications="notifications" />
    </div>
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { ref, computed, watch, onBeforeUnmount, toRefs } from 'vue';
import { useStore } from 'vuex';
import get from 'lodash/get';
import AuxiliaryProfileHeader from 'src/modules/client/components/auxiliary/AuxiliaryProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import { formatIdentity } from '@helpers/utils';
import ProfileInfo from 'src/modules/client/components/auxiliary/ProfileInfo';
import ProfileContracts from 'src/modules/client/components/auxiliary/ProfileContracts';
import ProfilePay from 'src/modules/client/components/auxiliary/ProfilePay';

export default {
  name: 'AuxiliaryProfile',
  props: {
    auxiliaryId: { type: String, required: true },
    defaultTab: { type: String, default: 'info' },
  },
  components: {
    'auxiliary-profile-header': AuxiliaryProfileHeader,
    'profile-tabs': ProfileTabs,
  },
  setup (props) {
    const metaInfo = { title: 'Fiche auxiliaire' };
    useMeta(metaInfo);
    const { defaultTab, auxiliaryId } = toRefs(props);

    const tabsContent = [
      {
        label: 'Infos personnelles',
        name: 'info',
        default: defaultTab.value === 'info',
        component: ProfileInfo,
        notification: 'profiles',
      },
      { label: 'Contrats', name: 'contracts', default: defaultTab.value === 'contracts', component: ProfileContracts },
      { label: 'Paie', name: 'pays', default: defaultTab.value === 'pays', component: ProfilePay },
    ];
    const auxiliaryName = ref('');

    const $store = useStore();
    const userProfile = computed(() => $store.state.userProfile.userProfile);
    const notifications = computed(() => $store.state.userProfile.notifications);

    watch(userProfile, async () => $store.dispatch('userProfile/updateNotifications'));
    watch(userProfile, () => { refreshAuxiliaryName(); });

    const refreshAuxiliaryName = () => {
      auxiliaryName.value = get(userProfile.value, 'identity') ? formatIdentity(userProfile.value.identity, 'FL') : '';
    };

    const created = async () => {
      await $store.dispatch('userProfile/fetchUserProfile', { userId: auxiliaryId.value });
      refreshAuxiliaryName();
    };

    onBeforeUnmount(() => { $store.dispatch('userProfile/resetUserProfile'); });

    created();

    return {
      // Data
      tabsContent,
      auxiliaryName,
      // Computed
      userProfile,
      notifications,
    };
  },
};
</script>
