<template>
  <q-page padding class="vendor-background column no-wrap">
    <template v-if="questionnaire">
      <ni-profile-header :title="questionnaireName" :header-info="headerInfo" />
      <profile-tabs :profile-id="questionnaireId" :tabs-content="tabsContent" class="tabs" />
    </template>
  </q-page>
</template>

<script>
import { createMetaMixin } from 'quasar';
import { ref, computed, watch, onBeforeUnmount, toRefs } from 'vue';
import { useStore } from 'vuex';
import get from 'lodash/get';
import ProfileHeader from '@components/ProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import { DRAFT, QUESTIONNAIRE_TYPES } from '@data/constants';
import ProfileEdition from 'src/modules/vendor/components/questionnaires/ProfileEdition';
import ProfileAnswers from 'src/modules/vendor/components/questionnaires/ProfileAnswers';

const metaInfo = { title: 'Fiche questionnaire' };

export default {
  name: 'QuestionnaireProfile',
  props: {
    questionnaireId: { type: String, required: true },
    defaultTab: { type: String, default: 'edition' },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'profile-tabs': ProfileTabs,
  },
  mixins: [createMetaMixin(metaInfo)],
  setup (props) {
    const { defaultTab, questionnaireId } = toRefs(props);

    const tabsContent = [
      { label: 'Édition', name: 'edition', default: defaultTab.value === 'edition', component: ProfileEdition },
      { label: 'Réponses', name: 'answers', default: defaultTab.value === 'answers', component: ProfileAnswers },
    ];
    const questionnaireName = ref('');

    const $store = useStore();
    const questionnaire = computed(() => $store.state.questionnaire.questionnaire);
    const headerInfo = computed(() => {
      const infos = [{ icon: 'bookmark_border', label: QUESTIONNAIRE_TYPES[questionnaire.value.type] }];

      if (questionnaire.value.status === DRAFT) infos.push({ icon: 'edit', label: 'Brouillon', class: 'info-warning' });
      else infos.push({ icon: 'check_circle', label: 'Publié', class: 'info-active' });

      return infos;
    });

    watch(questionnaire, () => { refreshProgramName(); });

    const refreshProgramName = () => { questionnaireName.value = get(questionnaire.value, 'name') || ''; };

    const refreshQuestionnaire = async () => {
      await $store.dispatch('questionnaire/fetchQuestionnaire', { questionnaireId: questionnaireId.value });
    };

    const created = async () => {
      await refreshQuestionnaire();
      refreshProgramName();
    };

    onBeforeUnmount(() => { $store.dispatch('questionnaire/resetQuestionnaire'); });

    created();

    return {
      // Data
      tabsContent,
      questionnaireName,
      // Computed
      questionnaire,
      headerInfo,
    };
  },
};
</script>

<style lang="sass" scoped>
.tabs
  flex: 1
</style>
