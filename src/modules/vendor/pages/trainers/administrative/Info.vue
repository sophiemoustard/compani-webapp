<template>
  <q-page v-if="loggedUser" padding class="vendor-background">
    <ni-title-header title="Informations personnelles" class="q-mb-xl" />
    <profile-info />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { computed } from 'vue';
import { useStore } from 'vuex';
import TitleHeader from '@components/TitleHeader';
import ProfileInfo from 'src/modules/vendor/components/trainers/ProfileInfo';

export default {
  name: 'Infos',
  components: {
    'ni-title-header': TitleHeader,
    'profile-info': ProfileInfo,
  },
  setup () {
    const metaInfo = { title: 'Fiche formateur' };
    useMeta(metaInfo);

    const $store = useStore();

    const loggedUser = computed(() => $store.state.main.loggedUser);

    return {
      // Computed
      loggedUser,
    };
  },
};
</script>
