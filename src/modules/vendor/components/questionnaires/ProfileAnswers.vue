<template>
  <div>
    <div class="filters-container">
      <ni-select :options="trainerList" :value="selectedTrainer" @input="updateSelectedTrainer" />
      <ni-select :options="companyList" :value="selectedCompany" @input="updateSelectedCompany" />
    </div>
    <q-card v-for="(card, cardIndex) of filteredAnswers.followUp" :key="cardIndex" flat class="q-mb-sm">
      <component :is="getChartComponent(card.template)" :card="card" />
    </q-card>
  </div>
</template>

<script>
import get from 'lodash/get';
import Questionnaires from '@api/Questionnaires';
import Users from '@api/Users';
import Companies from '@api/Companies';
import Select from '@components/form/Select';
import { formatAndSortIdentityOptions, formatAndSortOptions } from '@helpers/utils';
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
      selectedCompany: '',
      companyList: [],
    };
  },
  async created () {
    await Promise.all([this.getQuestionnaireAnswers(), this.getTrainerList(), this.getCompanyList()]);
  },
  computed: {
    filteredAnswers () {
      if (!get(this.questionnaireAnswers, 'followUp')) return {};

      return { ...this.questionnaireAnswers, followUp: this.questionnaireAnswers.followUp.map(this.formatFollowUp) };
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
          ...formatAndSortIdentityOptions(trainers),
        ];
      } catch (e) {
        this.trainerList = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des formateurs.');
      }
    },
    async getCompanyList () {
      try {
        const companies = await Companies.list();
        this.companyList = [
          { label: 'Toutes les structures', value: '' },
          ...formatAndSortOptions(companies, 'name'),
        ];
      } catch (e) {
        this.companyList = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des structures.');
      }
    },
    updateSelectedTrainer (trainerId) {
      this.selectedTrainer = trainerId;
    },
    updateSelectedCompany (companyId) {
      this.selectedCompany = companyId;
    },
    formatFollowUp (fu) {
      const answers = fu.answers
        .filter(a => !this.selectedTrainer || (get(a, 'course.trainer._id') === this.selectedTrainer))
        .filter(a => !this.selectedCompany || (a.traineeCompany === this.selectedCompany));

      return { ...fu, answers: answers.map(a => a.answer) };
    },
  },
};
</script>
