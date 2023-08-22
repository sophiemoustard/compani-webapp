<template>
  <div>
    <compani-header />
    <div class="justify-center client-background">
      <meta-infos :course="course" :questionnaire="questionnaire" />
      <start v-if="cardIndex === -1" :course="course" :trainee="tmpTrainee" @update-trainee="updateTrainee"
        @click="updateCardIndex" />
      <end v-if="cardIndex === questionnaire.cards.length" :course="course" :trainee="tmpTrainee"
        @click="updateCardIndex" @submit="createHistory" />
    </div>
  </div>
</template>

<script>
import { useMeta } from 'quasar';
import { toRefs, ref, computed } from 'vue';
import set from 'lodash/set';
import { useStore } from 'vuex';
import Courses from '@api/Courses';
import Questionnaires from '@api/Questionnaires';
import CompaniHeader from '@components/CompaniHeader';
import MetaInfos from '@components/questionnaires/cards/MetaInfos';
import Start from '@components/questionnaires/cards/Start';
import End from '@components/questionnaires/cards/End';
import { NotifyNegative, NotifyPositive } from '@components/popup/notify';
import { INCREMENT } from '@data/constants';
import QuestionnaireHistories from '@api/QuestionnaireHistories';

export default {
  name: 'QuestionnaireForm',
  props: {
    questionnaireId: { type: String, required: true },
    courseId: { type: String, required: true },
  },
  components: {
    'compani-header': CompaniHeader,
    'meta-infos': MetaInfos,
    start: Start,
    end: End,
  },
  setup (props) {
    const metaInfo = { title: 'Formulaire de réponse au questionnaire' };
    useMeta(metaInfo);

    const { courseId, questionnaireId } = toRefs(props);
    const course = ref({});
    const questionnaire = ref({});
    const tmpTrainee = ref({ _id: '' });

    const $store = useStore();
    const cardIndex = computed(() => $store.state.questionnaire.cardIndex);

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

    const updateCardIndex = async type => $store.dispatch('questionnaire/updateCardIndex', { type });

    const createHistory = async () => {
      try {
        const payload = {
          course: course.value._id,
          questionnaire: questionnaire.value._id,
          user: tmpTrainee.value._id,
        };

        await QuestionnaireHistories.create(payload);
        NotifyPositive('Réponse enregistrée.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'enregistrement des réponses au questionnaire.');
      }
    };

    return {
      // Data
      course,
      questionnaire,
      tmpTrainee,
      INCREMENT,
      // Computed
      cardIndex,
      // Methods
      updateTrainee,
      updateCardIndex,
      createHistory,
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
