<template>
  <q-page padding class="vendor-background">
    <ni-profile-header title="Auto-positionnement : réponses" class="q-mb-xl" />
    {{ questionnaireAnswers.followUp.length }}
  </q-page>
</template>

<script>
import { toRefs, ref } from 'vue';
import Questionnaires from '@api/Questionnaires';
import { REVIEW } from '@data/constants';
import { NotifyNegative } from '@components/popup/notify';
import ProfileHeader from '@components/ProfileHeader.vue';

export default {
  name: 'SelfPositionningAnswersProfile',
  props: {
    courseId: { type: String, required: true },
    questionnaireId: { type: String, required: true },
  },
  components: {
    'ni-profile-header': ProfileHeader,
  },
  setup (props) {
    const { courseId, questionnaireId } = toRefs(props);
    const questionnaireAnswers = ref({ followUp: [], course: {} });

    const getQuestionnaireAnswers = async () => {
      try {
        const query = { course: courseId.value, action: REVIEW };
        questionnaireAnswers.value = await Questionnaires.getQuestionnaireAnswers(questionnaireId.value, query);
      } catch (e) {
        questionnaireAnswers.value = { followUp: [], course: {} };
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des réponses au questionnaire.');
      }
    };

    const created = async () => {
      await getQuestionnaireAnswers();
    };

    created();

    return {
      // Data
      questionnaireAnswers,
    };
  },
};
</script>
