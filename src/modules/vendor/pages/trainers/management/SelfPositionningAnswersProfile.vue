<template>
  <q-page padding class="vendor-background">
    <ni-profile-header title="Auto-positionnement : réponses" :header-info="headerInfo" class="q-mb-xl">
      <template #title>
        <ni-select caption="Apprenant(e)" :options="traineeOptions" :model-value="selectedTrainee"
          @update:model-value="updateSelectedTrainee" class="selector" clearable />
      </template>
    </ni-profile-header>
    <ni-banner v-if="selectedTrainee" class="bg-peach-200" icon="info_outline">
      <template #message v-if="selectedTraineeHasEndQuestionnaireHistory">
        Pour valider les réponses aux questionnaires d’auto-positionnement de fin, veuillez : <br>
        <div class="q-pl-md">
          <li>
          pour chaque question : cocher “Je valide la note” ou cliquer sur “Ajuster la note” pour définir une
          nouvelle note
          </li>
          <li>renseigner un commentaire si nécessaire</li>
          <li>cliquer sur le bouton “Valider” pour enregistrer votre correction</li>
        </div>
      </template>
      <template #message v-else-if="Object.keys(filteredQuestionnaireAnswers).length">
        L'apprenant sélectionné n'a pas répondu au questionnaire d'auto-positionnement de fin de formation.
      </template>
      <template #message v-else>
        L'apprenant sélectionné n'a répondu à aucun questionnaire d'auto-positionnement pour cette formation.
      </template>
    </ni-banner>
    <self-positionning-item v-for="card of Object.values(filteredQuestionnaireAnswers)" :key="card._id" :item="card" />
  </q-page>
</template>

<script>
import { toRefs, ref, computed } from 'vue';
import get from 'lodash/get';
import Questionnaires from '@api/Questionnaires';
import { composeCourseName } from '@helpers/courses';
import { formatAndSortIdentityOptions } from '@helpers/utils';
import { REVIEW, INTRA, INTRA_HOLDING, START_COURSE } from '@data/constants';
import { NotifyNegative } from '@components/popup/notify';
import ProfileHeader from '@components/ProfileHeader';
import Select from '@components/form/Select';
import Banner from '@components/Banner';
import SelfPositionningItem from '../../../components/questionnaires/SelfPositionningItem';

export default {
  name: 'SelfPositionningAnswersProfile',
  props: {
    courseId: { type: String, required: true },
    questionnaireId: { type: String, required: true },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'ni-select': Select,
    'self-positionning-item': SelfPositionningItem,
    'ni-banner': Banner,
  },
  setup (props) {
    const { courseId, questionnaireId } = toRefs(props);
    const questionnaireAnswers = ref({});
    const selectedTrainee = ref('');

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
      const formattedTraineeQuestionnaireHistories = traineeFollowUp.map(history => formatHistory(history), 'user');

      const historiesByQuestion = {};
      for (const history of formattedTraineeQuestionnaireHistories) {
        const { questionnaireAnswersList } = history;

        for (const card of questionnaireAnswersList) {
          if (!historiesByQuestion[card.cardId]) {
            historiesByQuestion[card.cardId] = {
              answers: history.timeline === START_COURSE ? { startCourse: card.answer } : { endCourse: card.answer },
              question: card.question,
              labels: card.labels,
            };
          } else if (Object.keys(historiesByQuestion[card.cardId].answers).includes('startCourse')) {
            historiesByQuestion[card.cardId].answers = {
              ...historiesByQuestion[card.cardId].answers,
              endCourse: card.answer,
            };
          } else if (Object.keys(historiesByQuestion[card.cardId].answers).includes('endCourse')) {
            historiesByQuestion[card.cardId].answers = {
              ...historiesByQuestion[card.cardId].answers,
              startCourse: card.answer,
            };
          }
        }
      }

      return historiesByQuestion;
    });

    const selectedTraineeHasEndQuestionnaireHistory = computed(() => Object.keys(filteredQuestionnaireAnswers).length &&
      Object.values(filteredQuestionnaireAnswers.value).filter(a => !!get(a, 'answers.endCourse')).length);

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
      selectedTraineeHasEndQuestionnaireHistory,
    };
  },
};
</script>

<style lang="sass" scoped>
.selector
  width: 40%
</style>
