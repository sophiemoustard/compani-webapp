<template>
  <q-page padding class="vendor-background">
    <div v-if="loggedUser">
      <ni-profile-header title="Informations personnelles" />
      <profile-tabs :profile-id="loggedUser._id" :tabs-content="tabsContent" />
    </div>
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { computed, toRefs } from 'vue';
import { useStore } from 'vuex';
import ProfileHeader from '@components/ProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import ProfileInfo from 'src/modules/vendor/components/trainers/ProfileInfo';
import ProfileContract from 'src/modules/vendor/components/trainers/ProfileContract';

export default {
  name: 'Info',
  props: {
    defaultTab: { type: String, default: 'info' },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'profile-tabs': ProfileTabs,
  },
  setup (props) {
    const metaInfo = { title: 'Fiche formateur' };
    useMeta(metaInfo);
    const { defaultTab } = toRefs(props);

    const $store = useStore();

    const loggedUser = computed(() => $store.state.main.loggedUser);

    const tabsContent = [
      {
        label: 'Infos personnelles',
        name: 'info',
        default: defaultTab.value === 'info',
        component: ProfileInfo,
      },
      {
        label: 'Contrats',
        name: 'contracts',
        default: defaultTab.value === 'contracts',
        component: ProfileContract,
      },
    ];

    return {
      // Data
      tabsContent,
      // Computed
      loggedUser,
    };
  },
};
</script>
