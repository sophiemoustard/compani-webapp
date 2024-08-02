<template>
  <q-page class="vendor-background" padding>
    <ni-profile-header title="Réponses aux questionnaires">
      <template #title>
        <div class="selector-container">
          <ni-select :model-value="selectedQuestionnaireType" @update:model-value="updateSelectedQuestionnaireType"
            caption="Type de questionnaire" :options="questionnaireOptions" clearable />
          <ni-select v-if="selectedQuestionnaireType === SELF_POSITIONNING" :model-value="selectedProgram"
            @update:model-value="updateSelectedProgram" caption="Programme" :options="programOptions" clearable />
        </div>
      </template>
    </ni-profile-header>
    <profile-answers v-if="selectedQuestionnaireId" :questionnaire-id="selectedQuestionnaireId"
      :hide-program-filter="!!selectedProgram" />
  </q-page>
</template>

<script>
import { ref, computed, watch } from 'vue';
import get from 'lodash/get';
import ProfileHeader from '@components/ProfileHeader';
import Select from '@components/form/Select';
import ProfileAnswers from 'src/modules/vendor/components/questionnaires/ProfileAnswers';
import Questionnaires from '@api/Questionnaires';
import { formatAndSortOptions } from '@helpers/utils';
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
    const selectedProgram = ref('');

    const questionnaireOptions = Object.keys(QUESTIONNAIRE_TYPES)
      .map(type => ({ label: QUESTIONNAIRE_TYPES[type], value: type }));

    const selectedQuestionnaireId = computed(() => {
      const selectedQuestionnaire = selectedQuestionnaireType.value === SELF_POSITIONNING
        ? publishedQuestionnaires.value.find(q => get(q, 'program._id') === selectedProgram.value)
        : publishedQuestionnaires.value.find(q => q.type === selectedQuestionnaireType.value);

      return get(selectedQuestionnaire, '_id');
    });

    const programOptions = computed(() => formatAndSortOptions(
      publishedQuestionnaires.value.filter(q => q.program).map(q => q.program),
      'name'
    ));

    const updateSelectedQuestionnaireType = (value) => { selectedQuestionnaireType.value = value; };

    const updateSelectedProgram = (value) => { selectedProgram.value = value; };

    const getPublishedQuestionnaires = async () => {
      const questionnaires = await Questionnaires.list();

      publishedQuestionnaires.value = questionnaires.filter(q => q.status === PUBLISHED);
    };

    const created = async () => getPublishedQuestionnaires();

    created();

    watch(selectedQuestionnaireType, () => updateSelectedProgram(''));

    return {
      // Data
      selectedQuestionnaireType,
      questionnaireOptions,
      publishedQuestionnaires,
      selectedProgram,
      SELF_POSITIONNING,
      // Computed
      selectedQuestionnaireId,
      programOptions,
      // Methods
      updateSelectedQuestionnaireType,
      updateSelectedProgram,
    };
  },
};
</script>

<style lang="sass" scoped>
.selector-container
  display: grid
  grid-auto-flow: column
  grid-template-columns: auto
  justify-content: center
  grid-gap: 24px
  @media screen and (max-width: 767px)
    grid-auto-flow: row
    grid-template-rows: auto
    grid-gap: 0px
</style>
