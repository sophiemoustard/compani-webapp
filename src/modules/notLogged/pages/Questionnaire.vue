<template>
  <div>
    <compani-header />
    <div class="justify-center client-background">
      <meta-infos :course="course" :questionnaire="questionnaire" />
      <start :course="course" :trainee="tmpTrainee" @update-trainee="updateTrainee" />
    </div>
  </div>
</template>

<script>
import { toRefs, ref } from 'vue';
import set from 'lodash/set';
import Courses from '@api/Courses';
import Questionnaires from '@api/Questionnaires';
import CompaniHeader from '@components/CompaniHeader';
import MetaInfos from '@components/questionnaires/cards/MetaInfos';
import Start from '@components/questionnaires/cards/Start';

export default {
  name: 'Questionnaire',
  props: {
    questionnaireId: { type: String, required: true },
    courseId: { type: String, required: true },
  },
  components: {
    'compani-header': CompaniHeader,
    'meta-infos': MetaInfos,
    start: Start,
  },
  setup (props) {
    const { courseId, questionnaireId } = toRefs(props);
    const course = ref({});
    const questionnaire = ref({});
    const tmpTrainee = ref({ _id: '' });

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

    const updateTrainee = t => (set(tmpTrainee.value, '_id', t));

    return {
      // Data
      course,
      questionnaire,
      tmpTrainee,
      // Methods
      updateTrainee,
    };
  },
};
</script>

<style lang="sass" scoped>
.client-background
  min-height: 90vh
  @media screen and (max-width: 768px)
    height: 85vh
  display: flex
  flex: 1
  flex-direction: column
  align-items: space-around
  padding: 48px
</style>
