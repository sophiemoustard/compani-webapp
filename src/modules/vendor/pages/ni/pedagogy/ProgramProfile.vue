<template>
  <q-page padding class="vendor-background">
    <ni-profile-header :title="programName" />
    <profile-tabs :profile-id="programId" :tabs-content="tabsContent" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import get from 'lodash/get';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import ProfileHeader from '@components/ProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import ProfileInfo from 'src/modules/vendor/components/programs/ProfileInfo';
import ProfileContent from 'src/modules/vendor/components/programs/ProfileContent';

export default {
  name: 'ProgramProfile',
  props: {
    programId: { type: String, required: true },
    defaultTab: { type: String, default: 'infos' },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'profile-tabs': ProfileTabs,
  },
  setup (props) {
    const metaInfo = { title: 'Fiche programme' };
    useMeta(metaInfo);

    const programName = ref('');
    const tabsContent = [
      { label: 'Infos', name: 'infos', default: props.defaultTab === 'infos', component: ProfileInfo },
      { label: 'Sous-programmes', name: 'content', default: props.defaultTab === 'content', component: ProfileContent },
    ];

    const $route = useRoute();
    const $store = useStore();
    const program = computed(() => $store.state.program.program);

    watch(program, () => { refreshProgramName(); });

    const refreshProgramName = () => { programName.value = get(program.value, 'name') || ''; };

    const refreshProgram = async () => {
      try {
        await $store.dispatch('program/fetchProgram', { programId: props.programId });
      } catch (e) {
        console.error(e);
      }
    };

    const created = async () => {
      if (!program.value) await refreshProgram();
      refreshProgramName();
    };

    onBeforeUnmount(() => {
      if (!(new RegExp(`programs/${program.value._id}`)).test($route.path)) {
        $store.dispatch('program/resetProgram');
      }
    });

    created();

    return {
      // Data
      programName,
      tabsContent,
      // Computed
      program,
    };
  },
};
</script>
