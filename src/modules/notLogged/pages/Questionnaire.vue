<template>
  <div>
    <compani-header />
    <div class="row justify-center client-background">
      <meta-infos :course="course" :questionnaire="questionnaire" />
    </div>
  </div>
</template>

<script>
import { toRefs, ref } from 'vue';
import Courses from '@api/Courses';
import Questionnaires from '@api/Questionnaires';
import CompaniHeader from '@components/CompaniHeader';
import MetaInfos from '@components/questionnaires/MetaInfos';

export default {
  name: 'Questionnaire',
  props: {
    questionnaireId: { type: String, required: true },
    courseId: { type: String, required: true },
  },
  components: {
    'compani-header': CompaniHeader,
    'meta-infos': MetaInfos,
  },
  setup (props) {
    const { courseId, questionnaireId } = toRefs(props);
    const course = ref({});
    const questionnaire = ref({});

    const getCourse = async () => {
      const fetchedCourse = await Courses.get(courseId.value);
      course.value = fetchedCourse;
    };

    const getQuestionnaire = async () => {
      const fetchedQuestionnaire = await Questionnaires.get(questionnaireId.value);
      questionnaire.value = fetchedQuestionnaire;
    };

    const created = async () => {
      await getCourse();
      await getQuestionnaire();
    };

    created();

    return {
      // Data
      course,
      questionnaire,
    };
  },
};
</script>

<style lang="sass" scoped>
.client-background
  min-height: 100vh
  @media screen and (max-width: 768px)
    height: 85vh
</style>
