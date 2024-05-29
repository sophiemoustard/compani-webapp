<template>
  <q-page padding class="vendor-background">
    <ni-profile-header title="Auto-positionnement : réponses" :header-info="headerInfo" class="q-mb-xl">
      <template #title>
        <ni-select caption="Apprenant(e)" :options="traineeOptions" :model-value="selectedTrainee"
          @update:model-value="updateSelectedTrainee" class="selector" clearable />
      </template>
    </ni-profile-header>
    {{ filteredQuestionnaireAnswers }}
    <span>{{ filteredQuestionnaireAnswers.length }} / {{ get(questionnaireAnswers, 'followUp', []).length }}</span>
  </q-page>
</template>

<script>
import { toRefs, ref, computed } from 'vue';
import get from 'lodash/get';
import Questionnaires from '@api/Questionnaires';
import { REVIEW, INTRA, INTRA_HOLDING } from '@data/constants';
import { NotifyNegative } from '@components/popup/notify';
import ProfileHeader from '@components/ProfileHeader';
import Select from '@components/form/Select';
import { composeCourseName } from '@helpers/courses';
import { formatAndSortIdentityOptions } from '@helpers/utils';

export default {
  name: 'SelfPositionningAnswersProfile',
  props: {
    courseId: { type: String, required: true },
    questionnaireId: { type: String, required: true },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'ni-select': Select,
  },
  setup (props) {
    const { courseId, questionnaireId } = toRefs(props);
    const questionnaireAnswers = ref({});
    const selectedTrainee = ref('');

    const getQuestionnaireAnswers = async () => {
      try {
        const query = { course: courseId.value, action: REVIEW };
        questionnaireAnswers.value = await Questionnaires.getQuestionnaireAnswers(questionnaireId.value, query);
      } catch (e) {
        questionnaireAnswers.value = {};
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des réponses au questionnaire.');
      }
    };

    const headerInfo = computed(() => {
      const { course } = questionnaireAnswers.value;
      const infos = [{ icon: 'bookmark_border', label: get(course, 'subProgram') && composeCourseName(course) }];

      if ([INTRA, INTRA_HOLDING].includes(get(course, 'type'))) {
        infos.push({ icon: 'apartment', label: get(course, 'holding.name') || course.companies[0].name });
      }
      return infos;
    });

    const traineeOptions = computed(() => {
      const trainees = get(questionnaireAnswers.value, 'course.trainees', []);
      return formatAndSortIdentityOptions(trainees);
    });

    const formatHistory = (history) => {
      const questionnaireAnswersList = history.questionnaireAnswersList
        .map((a) => {
          const { question, labels, _id } = a.card;
          return { cardId: _id, question, labels, answer: a.answerList[0], timeline: history.timeline };
        });

      return { ...history, questionnaireAnswersList };
    };

    const filteredQuestionnaireAnswers = computed(() => {
      const followUp = get(questionnaireAnswers.value, 'followUp', []);

      const traineeFollowUp = followUp.filter(qa => qa.user === selectedTrainee.value);

      return traineeFollowUp.map(history => formatHistory(history));
    });

    const updateSelectedTrainee = (traineeId) => { selectedTrainee.value = traineeId; };

    const created = async () => {
      await getQuestionnaireAnswers();
    };

    created();

    return {
      // Data
      questionnaireAnswers,
      get,
      selectedTrainee,
      // Methods
      updateSelectedTrainee,
      // Computed
      headerInfo,
      traineeOptions,
      filteredQuestionnaireAnswers,
    };
  },
};
</script>

<style lang="sass" scoped>
.selector
  width: 40%
</style>
