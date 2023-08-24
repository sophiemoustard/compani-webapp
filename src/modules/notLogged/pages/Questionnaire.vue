<template>
  <div>
    <compani-header />
    <div class="questionnaire-container">
      <meta-infos :course="course" :questionnaire="questionnaire" />
      <start v-if="cardIndex === startCardIndex" :course="course" :trainee="trainee" @update-trainee="updateTrainee" />
      <div v-for="(card, index) of questionnaire.cards" :key="card._id">
        <card-template class="card-container" v-if="cardIndex === index" :card="card" @submit="updateCardIndex" />
      </div>
      <end v-if="cardIndex === endCardIndex" :course="course" :trainee="trainee"
        :loading="btnLoading" @submit="createHistory" />
    </div>
  </div>
</template>

<script>
import { toRefs, ref, computed } from 'vue';
import set from 'lodash/set';
import get from 'lodash/get';
import { useStore } from 'vuex';
import Courses from '@api/Courses';
import Questionnaires from '@api/Questionnaires';
import CompaniHeader from '@components/CompaniHeader';
import MetaInfos from '@components/questionnaires/cards/MetaInfos';
import Start from '@components/questionnaires/cards/Start';
import End from '@components/questionnaires/cards/End';
import CardTemplate from '@components/questionnaires/cards/CardTemplate';
import { NotifyNegative, NotifyPositive } from '@components/popup/notify';
import { INCREMENT } from '@data/constants';
import QuestionnaireHistories from '@api/QuestionnaireHistories';

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
    end: End,
    'card-template': CardTemplate,
  },
  setup (props) {
    const { courseId, questionnaireId } = toRefs(props);
    const course = ref({});
    const questionnaire = ref({});
    const trainee = ref({ _id: '' });
    const btnLoading = ref(false);
    const startCardIndex = ref(-1);

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

    const updateTrainee = t => (set(trainee.value, '_id', t));

    const createHistory = async () => {
      try {
        btnLoading.value = true;
        const payload = {
          course: course.value._id,
          questionnaire: questionnaire.value._id,
          user: trainee.value._id,
        };

        await QuestionnaireHistories.create(payload);
        NotifyPositive('Réponse enregistrée.');
      } catch (e) {
        console.error(e);

        if (e.response.status === 409) return NotifyNegative(e.response.data.message);
        NotifyNegative('Erreur lors de l\'enregistrement des réponses au questionnaire.');
      } finally {
        btnLoading.value = false;
      }
    };

    const endCardIndex = computed(() => (get(questionnaire.value, 'cards') ? questionnaire.value.cards.length : null));

    return {
      // Data
      course,
      questionnaire,
      trainee,
      INCREMENT,
      btnLoading,
      endCardIndex,
      startCardIndex,
      // Computed
      cardIndex,
      // Methods
      updateTrainee,
      createHistory,
    };
  },
};
</script>

<style lang="sass" scoped>
</style>
