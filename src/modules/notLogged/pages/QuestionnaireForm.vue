<template>
  <div>
    <compani-header />
    <div class="questionnaire-container">
      <meta-infos :course="course" :questionnaire="questionnaire" />
      <start v-if="cardIndex === startCardIndex" :course="course" :trainee="trainee" :validations="v$"
        @update-trainee="updateTrainee" />
      <end v-if="cardIndex === endCardIndex" :course="course" :trainee="trainee" :loading="btnLoading"
        @submit="createHistory" />
    </div>
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
    const trainee = ref('');
    const btnLoading = ref(false);
    const startCardIndex = ref(-1);
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
      endCardIndex,
      startCardIndex,
      // Computed
      cardIndex,
      // Methods
      updateTrainee,
      createHistory,
      // Validations
      v$,
    };
  },
};
</script>

<style lang="sass" scoped>
</style>
