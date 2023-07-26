<template>
  <div>
    <div class="filters-container">
      <ni-select :options="trainerList" :model-value="selectedTrainer" @update:model-value="updateSelectedTrainer" />
      <ni-select :options="companyList" :model-value="selectedCompany" @update:model-value="updateSelectedCompany" />
      <ni-select :options="programList" :model-value="selectedProgram" @update:model-value="updateSelectedProgram" />
      <div class="reset-filters" @click="resetFilters">Effacer les filtres</div>
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
import Programs from '@api/Programs';
import Select from '@components/form/Select';
import { formatAndSortIdentityOptions, formatAndSortOptions } from '@helpers/utils';
import { NotifyNegative } from '@components/popup/notify';
import { questionnaireAnswersMixin } from 'src/modules/vendor/mixins/questionnaireAnswersMixin';
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
      selectedProgram: '',
      programList: [],
    };
  },
  async created () {
    await Promise.all([
      this.getQuestionnaireAnswers(),
      this.getTrainerList(),
      this.getCompanyList(),
      this.getProgramList(),
    ]);
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
    async getProgramList () {
      try {
        const programs = await Programs.list();
        this.programList = [
          { label: 'Tous les programmes', value: '' },
          ...formatAndSortOptions(programs, 'name'),
        ];
      } catch (e) {
        this.programList = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des programmes.');
      }
    },
    updateSelectedTrainer (trainerId) {
      this.selectedTrainer = trainerId;
    },
    updateSelectedCompany (companyId) {
      this.selectedCompany = companyId;
    },
    updateSelectedProgram (programId) {
      this.selectedProgram = programId;
    },
    formatFollowUp (fu) {
      const answers = fu.answers
        .filter(a => !this.selectedTrainer || (get(a, 'course.trainer') === this.selectedTrainer))
        .filter(a => !this.selectedCompany || (a.traineeCompany === this.selectedCompany))
        .filter(a => !this.selectedProgram || (get(a, 'course.subProgram.program._id') === this.selectedProgram));

      return { ...fu, answers: answers.map(a => a.answer) };
    },
    resetFilters () {
      this.selectedTrainer = '';
      this.selectedCompany = '';
      this.selectedProgram = '';
    },
  },
};
</script>

<style lang="sass" scoped>
.filters-container
    grid-template-columns: repeat(3, 28%) 16%
    @media screen and (max-width: 767px)
      width: 95%
</style>
