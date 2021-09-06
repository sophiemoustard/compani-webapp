<template>
  <div>
    <ni-select :options="trainerList" :value="selectedTrainer" @input="updateSelectedTrainer" class="select" />
    <q-card v-for="(card, cardIndex) of questionnaireAnswersFormattedAndFiltered.followUp" :key="cardIndex" flat
      class="q-mb-sm">
      <component :is="getChartComponent(card.template)" :card="card" />
    </q-card>
  </div>
</template>

<script>
import uniqBy from 'lodash/uniqBy';
import get from 'lodash/get';
import Questionnaires from '@api/Questionnaires';
import Users from '@api/Users';
import Select from '@components/form/Select';
import { formatAndSortIdentityOptions } from '@helpers/utils';
import { NotifyNegative } from '@components/popup/notify';
import { questionnaireAnswersMixin } from '@mixins/questionnaireAnswersMixin';
import { TRAINER, TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN } from '@data/constants';

export default {
  name: 'ProfileAnswers',
  components: {
    'ni-select': Select,
  },
  mixins: [questionnaireAnswersMixin],
  props: {
    profileId: { type: String, required: true },
  },
  data () {
    return {
      questionnaireAnswers: {},
      selectedTrainer: '',
      trainerList: [],
    };
  },
  async created () {
    await Promise.all([this.getQuestionnaireAnswers(), this.getTrainerList()]);
  },
  computed: {
    questionnaireAnswersFormattedAndFiltered () {
      let followUp = [];
      if (!get(this.questionnaireAnswers, 'followUp')) return {};
      if (!this.selectedTrainer) {
        followUp = this.questionnaireAnswers.followUp.map(fu => ({ ...fu, answers: fu.answers.map(a => a.answer) }));
      } else {
        followUp = this.questionnaireAnswers.followUp
          .map(fu => ({
            ...fu,
            answers: fu.answers
              .filter(a => (get(a, 'course.trainer._id') === this.selectedTrainer))
              .map(a => a.answer),
          }));
      }

      return {
        ...this.questionnaireAnswers,
        followUp,
      };
    },
  },
  methods: {
    async getQuestionnaireAnswers () {
      try {
        this.questionnaireAnswers = await Questionnaires.getQuestionnaireAnswers(this.profileId);
      } catch (e) {
        this.questionnaireAnswers = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des réponses au questionnaire.');
      }
    },
    async getTrainerList () {
      try {
        const trainers = await Users.list({ role: [TRAINER, TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN] });
        this.trainerList = [
          { label: 'Tous les intervenants', value: '' },
          { label: 'Sans intervenant(e)', value: 'without_trainer' },
          ...uniqBy(formatAndSortIdentityOptions(trainers), 'value'),
        ];
      } catch (e) {
        this.trainerList = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des formateurs.');
      }
    },
    updateSelectedTrainer (trainerId) {
      this.selectedTrainer = trainerId;
    },
  },
};
</script>

<style lang="stylus" scoped>
  .select
    width: 30%
</style>
