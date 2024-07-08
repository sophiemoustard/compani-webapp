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
import { computed, toRefs, ref } from 'vue';
import get from 'lodash/get';
import Questionnaires from '@api/Questionnaires';
import Users from '@api/Users';
import Companies from '@api/Companies';
import Programs from '@api/Programs';
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
  setup (props) {
    const { profileId } = toRefs(props);
    const questionnaireAnswers = ref({});
    const selectedTrainer = ref('');
    const trainerList = ref([]);
    const selectedCompany = ref('');
    const companyList = ref([]);
    const selectedProgram = ref('');
    const programList = ref([]);

    const filteredAnswers = computed(() => {
      if (!get(questionnaireAnswers.value, 'followUp')) return {};

      return { ...questionnaireAnswers.value, followUp: questionnaireAnswers.value.followUp.map(formatFollowUp) };
    });

    const getQuestionnaireAnswers = async () => {
      try {
        questionnaireAnswers.value = await Questionnaires.getQuestionnaireAnswers(profileId.value);
      } catch (e) {
        questionnaireAnswers.value = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des réponses au questionnaire.');
      }
    };

    const getTrainerList = async () => {
      try {
        const trainers = await Users.list({ role: [TRAINER, TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN] });
        trainerList.value = [{ label: 'Tous les intervenants', value: '' }, ...formatAndSortIdentityOptions(trainers)];
      } catch (e) {
        trainerList.value = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des formateurs.');
      }
    };

    const getCompanyList = async () => {
      try {
        const companies = await Companies.list();
        companyList.value = [{ label: 'Toutes les structures', value: '' }, ...formatAndSortOptions(companies, 'name')];
      } catch (e) {
        companyList.value = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des structures.');
      }
    };

    const getProgramList = async () => {
      try {
        const programs = await Programs.list();
        programList.value = [{ label: 'Tous les programmes', value: '' }, ...formatAndSortOptions(programs, 'name')];
      } catch (e) {
        programList.value = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des programmes.');
      }
    };

    const updateSelectedTrainer = (trainerId) => { selectedTrainer.value = trainerId; };

    const updateSelectedCompany = (companyId) => { selectedCompany.value = companyId; };

    const updateSelectedProgram = (programId) => { selectedProgram.value = programId; };

    const formatFollowUp = (fu) => {
      const answers = fu.answers
        .filter(a => !selectedTrainer.value || (get(a, 'course.trainer') === selectedTrainer.value))
        .filter(a => !selectedCompany.value || (a.traineeCompany === selectedCompany.value))
        .filter(a => !selectedProgram.value || (get(a, 'course.subProgram.program._id') === selectedProgram.value));

      return { ...fu, answers: answers.map(a => a.answer) };
    };

    const resetFilters = () => {
      selectedTrainer.value = '';
      selectedCompany.value = '';
      selectedProgram.value = '';
    };

    const created = async () => {
      await Promise.all([
        getQuestionnaireAnswers(),
        getTrainerList(),
        getCompanyList(),
        getProgramList(),
      ]);
    };

    created();

    return {
      // Data
      questionnaireAnswers,
      selectedTrainer,
      trainerList,
      selectedCompany,
      companyList,
      selectedProgram,
      programList,
      // Computed
      filteredAnswers,
      // Methods
      getQuestionnaireAnswers,
      getTrainerList,
      getCompanyList,
      getProgramList,
      updateSelectedTrainer,
      updateSelectedCompany,
      updateSelectedProgram,
      resetFilters,
    };
  },
};
</script>

<style lang="sass" scoped>
.filters-container
    grid-template-columns: repeat(3, 28%) 16%
    @media screen and (max-width: 767px)
      width: 95%
</style>
