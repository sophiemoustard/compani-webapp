<template>
  <q-page padding class="vendor-background">
    <ni-profile-header :title="holdingName" />
    <profile-tabs :profile-id="holdingId" :tabs-content="tabsContent" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { computed, ref, watch, onBeforeUnmount, toRefs } from 'vue';
import { useStore } from 'vuex';
import get from 'lodash/get';
import ProfileHeader from '@components/ProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import ProfileInfo from 'src/modules/vendor/components/holdings/ProfileInfo';

export default {
  name: 'HoldingProfile',
  props: {
    holdingId: { type: String, required: true },
    defaultTab: { type: String, default: 'infos' },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'profile-tabs': ProfileTabs,
  },
  setup (props) {
    const { holdingId, defaultTab } = toRefs(props);
    const metaInfo = { title: 'Fiche société mère' };
    useMeta(metaInfo);
    const $store = useStore();

    const tabsContent = [
      { label: 'Infos', name: 'infos', default: defaultTab.value === 'infos', component: ProfileInfo },
    ];
    const holdingName = ref('');

    const holding = computed(() => $store.state.holding.holding);

    const refreshHolding = async () => {
      try {
        await $store.dispatch('holding/fetchHolding', { holdingId: holdingId.value });
      } catch (e) {
        console.error(e);
      }
    };

    const refreshHoldingName = () => { holdingName.value = get(holding, 'value.name') || ''; };

    watch(holding, refreshHoldingName);

    const created = async () => {
      if (!holding.value) await refreshHolding();
      refreshHoldingName();
    };

    onBeforeUnmount(() => $store.dispatch('holding/resetHolding'));

    created();

    return {
      // Data
      tabsContent,
      holdingName,
    };
  },
};
</script>
