<template>
  <q-page padding class="vendor-background">
    <ni-profile-header title="Auto-positionnement : réponses" :header-info="headerInfo" class="q-mb-xl" />
    {{ get(questionnaireAnswers, 'followUp', []).length }}
  </q-page>
</template>

<script>
import { toRefs, ref, computed } from 'vue';
import get from 'lodash/get';
import Questionnaires from '@api/Questionnaires';
import { REVIEW, INTRA, INTRA_HOLDING } from '@data/constants';
import { NotifyNegative } from '@components/popup/notify';
import ProfileHeader from '@components/ProfileHeader.vue';
import { composeCourseName } from '@helpers/courses';

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
    const questionnaireAnswers = ref({});

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

    const created = async () => {
      await getQuestionnaireAnswers();
    };

    created();

    return {
      // Data
      questionnaireAnswers,
      get,
      // Computed
      headerInfo,
    };
  },
};
</script>
