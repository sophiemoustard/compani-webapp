<template>
  <q-page padding class="vendor-background">
    <ni-profile-header title="Auto-positionnement : réponses" :header-info="headerInfo" class="q-mb-xl">
      <template #title>
        <ni-select caption="Apprenant(e)" :options="traineeOptions" :model-value="selectedTrainee"
          @update:model-value="validateTraineeSelection" class="selector" clearable :blur-on-selection="false" />
      </template>
    </ni-profile-header>
    <template v-if="selectedTrainee">
      <ni-banner v-if="get(endQuestionnaireHistory, 'isValidated')" class="bg-peach-200" icon="info_outline">
        <template #message>
          Vous avez déjà validé les réponses au questionnaire d'auto-positionnement de fin pour cet apprenant.
        </template>
      </ni-banner>
      <template v-else>
        <ni-banner class="bg-peach-200" icon="info_outline">
          <template #message v-if="get(endQuestionnaireHistory, '_id')">
            Pour valider les réponses au questionnaire d’auto-positionnement de fin, veuillez : <br>
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
        <self-positionning-item v-for="card of Object.values(filteredQuestionnaireAnswers)" :key="card._id" :item="card"
          @update-trainer-answers="updateTrainerAnswers" />
        <div v-if="get(endQuestionnaireHistory, '_id')" class="flex justify-end q-pa-lg">
          <ni-button class="bg-primary" color="white" label="Valider les réponses" @click="validateTrainerAnswers" />
        </div>
      </template>
    </template>
  </q-page>
</template>

<script>
import { toRefs, ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import get from 'lodash/get';
import omit from 'lodash/omit';
import Questionnaires from '@api/Questionnaires';
import QuestionnaireHistories from '@api/QuestionnaireHistories';
import { composeCourseName } from '@helpers/courses';
import { formatAndSortIdentityOptions } from '@helpers/utils';
import { REVIEW, INTRA, INTRA_HOLDING, START_COURSE, END_COURSE } from '@data/constants';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import ProfileHeader from '@components/ProfileHeader';
import Select from '@components/form/Select';
import Banner from '@components/Banner';
import Button from '@components/Button';
import SelfPositionningItem from 'src/modules/vendor/components/questionnaires/SelfPositionningItem';

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
    'ni-button': Button,
  },
  setup (props) {
    const $q = useQuasar();
    const { courseId, questionnaireId } = toRefs(props);
    const questionnaireAnswers = ref({});
    const selectedTrainee = ref('');
    const trainerAnswers = ref([]);

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
      const formattedTraineeQuestionnaireHistories = traineeFollowUp.map(history => formatHistory(history));

      const historiesByQuestion = {};
      for (const history of formattedTraineeQuestionnaireHistories) {
        for (const card of history.questionnaireAnswersList) {
          historiesByQuestion[card.cardId] = {
            answers: {
              ...get(historiesByQuestion[card.cardId], 'answers'),
              ...(history.timeline === START_COURSE ? { startCourse: card.answer } : { endCourse: card.answer }),
            },
            question: card.question,
            labels: card.labels,
            card: card.cardId,
          };
        }
      }

      return historiesByQuestion;
    });

    const endQuestionnaireHistory = computed(() => {
      const followUp = get(questionnaireAnswers.value, 'followUp', []);
      const traineeFollowUp = followUp.filter(qa => qa.user === selectedTrainee.value);

      return traineeFollowUp.find(qa => qa.timeline === END_COURSE) || {};
    });

    const refreshQuestionnaireAnswers = async () => {
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

    const validateTraineeSelection = (traineeId) => {
      if (trainerAnswers.value.some(a => a.isValidated)) {
        $q.dialog({
          title: 'Confirmation',
          message: `Êtes-vous sûr(e) de vouloir changer d'apprenant &nbsp;? Les informations renseignées pour
            ${traineeOptions.value.find(t => t.value === selectedTrainee.value).label} seront perdues.`,
          html: true,
          ok: true,
          cancel: 'Annuler',
        }).onOk(() => {
          trainerAnswers.value = [];
          updateSelectedTrainee(traineeId);
        })
          .onCancel(() => NotifyPositive('Changement d\'apprenant annulé.'));
      } else {
        trainerAnswers.value = [];
        updateSelectedTrainee(traineeId);
      }
    };

    const updateTrainerAnswers = ({ card, isValidated }) => {
      const answer = trainerAnswers.value.find(a => a.card === card);
      if (answer) answer.isValidated = isValidated;
      else trainerAnswers.value.push({ card, isValidated });
    };

    const validateTrainerAnswers = async () => {
      try {
        const traineeAnswersLength = Object.values(filteredQuestionnaireAnswers.value).length;
        const trainerAnswersLength = trainerAnswers.value.filter(a => a.isValidated).length;

        if (trainerAnswersLength !== traineeAnswersLength) return NotifyWarning('Champ(s) invalide(s)');

        const formattedAnswers = trainerAnswers.value.map(a => omit(a, ['isValidated']));
        await QuestionnaireHistories.update(endQuestionnaireHistory.value._id, { trainerAnswers: formattedAnswers });

        NotifyPositive('Validation enregistrée.');
        await refreshQuestionnaireAnswers();
        trainerAnswers.value = [];
      } catch (e) {
        trainerAnswers.value = [];

        console.error(e);
        NotifyNegative('Erreur lors de la validation des réponses au questionnaire.');
      }
    };

    const created = async () => {
      await refreshQuestionnaireAnswers();
    };

    created();

    return {
      // Data
      questionnaireAnswers,
      get,
      selectedTrainee,
      trainerAnswers,
      // Methods
      updateTrainerAnswers,
      validateTrainerAnswers,
      validateTraineeSelection,
      // Computed
      headerInfo,
      traineeOptions,
      filteredQuestionnaireAnswers,
      endQuestionnaireHistory,
    };
  },
};
</script>

<style lang="sass" scoped>
.selector
  width: 40%
</style>
