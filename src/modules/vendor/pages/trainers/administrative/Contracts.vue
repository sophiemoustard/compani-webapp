<template>
  <q-page padding class="vendor-background">
    <div v-if="loggedUser">
      <ni-title-header title="Ordres de mission" class="q-mb-xl" />
      <profile-contract />
    </div>
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { computed } from 'vue';
import { useStore } from 'vuex';
import TitleHeader from '@components/TitleHeader';
import ProfileContract from 'src/modules/vendor/components/trainers/ProfileContract';

export default {
  name: 'Contracts',
  components: {
    'ni-title-header': TitleHeader,
    'profile-contract': ProfileContract,
  },
  setup () {
    const metaInfo = { title: 'Ordres de mission' };
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
