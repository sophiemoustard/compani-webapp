<template>
  <questionnaire-answers-container :cards="questionnaireAnswers" />
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import uniq from 'lodash/uniq';
import Courses from '@api/Courses';
import { NotifyNegative } from '@components/popup/notify';
import QuestionnaireAnswersContainer from 'src/modules/vendor/components/questionnaires/QuestionnaireAnswersContainer';

export default {
  name: 'ProfileQuestionnaires',
  components: {
    'questionnaire-answers-container': QuestionnaireAnswersContainer,
  },
  setup () {
    const questionnaireAnswers = ref([]);

    const $store = useStore();
    const course = computed(() => $store.state.course.course);

    const created = async () => {
      try {
        const qa = await Courses.getQuestionnaireAnswers(course.value._id);

        questionnaireAnswers.value = qa.map(qAnswer => ({
          ...qAnswer,
          answers: qAnswer.answers.map(a => a.answer),
          traineeCount: uniq(qAnswer.answers.map(a => a.trainee)).length,
          historyCount: uniq(qAnswer.answers.map(a => a.history)).length,
        }));
      } catch (e) {
        questionnaireAnswers.value = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des questionnaires.');
      }
    };

    created();

    return {
      // Data
      questionnaireAnswers,
    };
  },
};
</script>
