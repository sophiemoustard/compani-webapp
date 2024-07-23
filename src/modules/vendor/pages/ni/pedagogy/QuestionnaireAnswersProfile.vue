<template>
  <q-page class="vendor-background" padding>
    <ni-profile-header title="Réponses aux questionnaires">
      <template #title>
        <ni-select class="selector" :model-value="selectedQuestionnaireType"
          @update:model-value="updateSelectedQuestionnaireType" caption="Type de questionnaire"
          :options="questionnaireOptions" clearable />
      </template>
    </ni-profile-header>
    <profile-answers v-if="selectedQuestionnaireId" :profile-id="selectedQuestionnaireId" />
  </q-page>
</template>

<script>
import { ref, computed } from 'vue';
import get from 'lodash/get';
import ProfileHeader from '@components/ProfileHeader';
import Select from '@components/form/Select';
import ProfileAnswers from 'src/modules/vendor/components/questionnaires/ProfileAnswers';
import Questionnaires from '@api/Questionnaires';
import { QUESTIONNAIRE_TYPES, SELF_POSITIONNING, PUBLISHED } from '@data/constants';

export default {
  name: 'QuestionnaireAnswersProfile',
  components: {
    'ni-profile-header': ProfileHeader,
    'ni-select': Select,
    'profile-answers': ProfileAnswers,
  },
  setup () {
    const selectedQuestionnaireType = ref('');
    const publishedQuestionnaires = ref([]);
    const questionnaireOptions = Object.keys(QUESTIONNAIRE_TYPES)
      .filter(type => type !== SELF_POSITIONNING)
      .map(type => ({ label: QUESTIONNAIRE_TYPES[type], value: type }));

    const selectedQuestionnaireId = computed(() => {
      const selectedQuestionnaire = publishedQuestionnaires.value
        .find(q => q.type === selectedQuestionnaireType.value);

      return get(selectedQuestionnaire, '_id');
    });

    const updateSelectedQuestionnaireType = (value) => { selectedQuestionnaireType.value = value; };

    const getPublishedQuestionnaires = async () => {
      const questionnaires = await Questionnaires.list();

      publishedQuestionnaires.value = questionnaires.filter(q => q.status === PUBLISHED);
    };

    const created = async () => getPublishedQuestionnaires();

    created();

    return {
      // Data
      selectedQuestionnaireType,
      questionnaireOptions,
      publishedQuestionnaires,
      // Computed
      selectedQuestionnaireId,
      // Methods
      updateSelectedQuestionnaireType,
    };
  },
};
</script>

<style lang="sass" scoped>
.selector
  width: 40%
</style>
