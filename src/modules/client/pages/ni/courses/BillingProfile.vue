<template>
  <q-page padding class="client-background">
    <ni-title-header title="Factures" />
    <div v-if="loggedUser">
      <profile-billing />
    </div>
  </q-page>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import TitleHeader from '@components/TitleHeader';
import ProfileBilling from 'src/modules/vendor/components/companies/ProfileBilling';

export default {
  name: 'BillingProfile',
  components: {
    'ni-title-header': TitleHeader,
    'profile-billing': ProfileBilling,
  },
  setup () {
    const $store = useStore();
    const loggedUser = computed(() => $store.state.main.loggedUser);

    return {
      // Computed
      loggedUser,
    };
  },
};
</script>
