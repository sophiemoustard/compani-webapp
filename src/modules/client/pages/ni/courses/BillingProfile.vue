<template>
  <q-page padding class="client-background">
    <div v-if="loggedUser">
      <profile-billing />
    </div>
</q-page>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import ProfileBilling from 'src/modules/vendor/components/companies/ProfileBilling';

export default {

  components: {
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
