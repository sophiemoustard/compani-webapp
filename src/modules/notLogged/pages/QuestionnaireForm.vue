<template>
  <compani-header />
  <div class="questionnaire-container">
    <meta-infos :course="course" :questionnaire="questionnaire" :trainee-name="traineeName"
      :display-name="!isStartorEndCard" />
    <start v-if="cardIndex === startCardIndex" :course="course" :trainee="trainee" :validations="v$"
      :end-card-index="endCardIndex" @update-trainee="updateTrainee" />
    <template v-for="(card, index) of questionnaire.cards" :key="card._id">
      <card-template v-if="cardIndex === index" :card="card" />
    </template>
    <end v-if="cardIndex === endCardIndex" :trainee-name="traineeName" :loading="btnLoading"
      @submit="createHistory" />
  </div>
</template>

<script>
import { useMeta } from 'quasar';
import { toRefs, ref, computed } from 'vue';
import get from 'lodash/get';
import { useStore } from 'vuex';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import Courses from '@api/Courses';
import Questionnaires from '@api/Questionnaires';
import QuestionnaireHistories from '@api/QuestionnaireHistories';
import CompaniHeader from '@components/CompaniHeader';
import MetaInfos from '@components/questionnaires/cards/MetaInfos';
import Start from '@components/questionnaires/cards/Start';
import End from '@components/questionnaires/cards/End';
import CardTemplate from '@components/questionnaires/cards/CardTemplate';
import { NotifyNegative, NotifyPositive } from '@components/popup/notify';
import { INCREMENT, START_CARD_INDEX } from '@data/constants';
import { formatIdentity } from '@helpers/utils';

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
    'card-template': CardTemplate,
  },
  setup (props) {
    const metaInfo = { title: 'Formulaire de réponse au questionnaire' };
    useMeta(metaInfo);

    const { courseId, questionnaireId } = toRefs(props);
    const course = ref({});
    const questionnaire = ref({});
    const trainee = ref('');
    const btnLoading = ref(false);
    const startCardIndex = ref(START_CARD_INDEX);
    const endCardIndex = ref(0);

    const $store = useStore();
    const cardIndex = computed(() => $store.state.questionnaire.cardIndex);

    const rules = computed(() => ({ trainee: { required } }));
    const v$ = useVuelidate(rules, { trainee });

    const getCourse = async () => {
      try {
        const fetchedCourse = await Courses.getFromNotLogged(courseId.value);
        course.value = fetchedCourse;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des informations de la formation.');
      }
    };

    const getQuestionnaire = async () => {
      try {
        const fetchedQuestionnaire = await Questionnaires.getFromNotLogged(questionnaireId.value);
        questionnaire.value = fetchedQuestionnaire;

        endCardIndex.value = get(questionnaire.value, 'cards').length;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des informations de la formation.');
      }
    };

    const updateTrainee = (t) => { trainee.value = t; };

    const createHistory = async () => {
      try {
        btnLoading.value = true;
        const payload = {
          course: course.value._id,
          questionnaire: questionnaire.value._id,
          user: trainee.value,
          questionnaireAnswersList: $store.state.questionnaire.answerList,
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

    const traineeName = computed(() => {
      const trainees = get(course.value, 'trainees') || [];
      const traineeIdentity = get(trainees.find(t => t._id === trainee.value), 'identity');

      return formatIdentity(traineeIdentity, 'FL');
    });

    const isStartorEndCard = computed(() => [startCardIndex.value, endCardIndex.value].includes(cardIndex.value));

    const created = async () => {
      await Promise.all([getCourse(), getQuestionnaire()]);
    };

    created();

    return {
      // Data
      course,
      questionnaire,
      trainee,
      INCREMENT,
      btnLoading,
      startCardIndex,
      // Computed
      cardIndex,
      endCardIndex,
      traineeName,
      isStartorEndCard,
      // Methods
      updateTrainee,
      createHistory,
      // Validations
      v$,
    };
  },
};
</script>
