<template>
  <div>
    <div class="filters-container">
      <ni-select :options="trainerOptions" :model-value="selectedTrainer" @update:model-value="updateSelectedTrainer"
        clearable />
      <ni-select :options="companyOptions" :model-value="selectedCompany" @update:model-value="updateSelectedCompany"
        clearable />
      <ni-select :options="programOptions" :model-value="selectedProgram" @update:model-value="updateSelectedProgram"
        clearable />
      <ni-select :options="holdingOptions" :model-value="selectedHolding" @update:model-value="updateSelectedHolding"
        clearable />
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
import keyBy from 'lodash/keyBy';
import mapValues from 'lodash/mapValues';
import Questionnaires from '@api/Questionnaires';
import Holdings from '@api/Holdings';
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
    const trainerOptions = ref([]);
    const selectedCompany = ref('');
    const companyOptions = ref([]);
    const selectedProgram = ref('');
    const programOptions = ref([]);
    const selectedHolding = ref('');
    const holdingOptions = ref([]);
    const holdingCompanies = ref([]);

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

    const getTrainerOptions = async () => {
      try {
        const trainers = await Users.list({ role: [TRAINER, TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN] });
        trainerOptions.value = [
          { label: 'Tous les intervenants', value: '' },
          ...formatAndSortIdentityOptions(trainers),
        ];
      } catch (e) {
        trainerOptions.value = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des formateurs.');
      }
    };

    const getCompanyOptions = async () => {
      try {
        const companies = await Companies.list();
        companyOptions.value = [
          { label: 'Toutes les structures', value: '' },
          ...formatAndSortOptions(companies, 'name'),
        ];
      } catch (e) {
        companyOptions.value = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des structures.');
      }
    };

    const getProgramOptions = async () => {
      try {
        const programs = await Programs.list();
        programOptions.value = [{ label: 'Tous les programmes', value: '' }, ...formatAndSortOptions(programs, 'name')];
      } catch (e) {
        programOptions.value = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des programmes.');
      }
    };

    const getHoldingOptions = async () => {
      try {
        const holdings = await Holdings.list();
        holdingOptions.value = [
          { label: 'Toutes les sociétés mères', value: '' },
          ...formatAndSortOptions(holdings, 'name'),
        ];

        holdingCompanies.value = mapValues(keyBy(holdings, '_id'), 'companies');
      } catch (e) {
        programOptions.value = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des programmes.');
      }
    };

    const updateSelectedTrainer = (trainerId) => { selectedTrainer.value = trainerId; };

    const updateSelectedCompany = (companyId) => { selectedCompany.value = companyId; };

    const updateSelectedProgram = (programId) => { selectedProgram.value = programId; };

    const updateSelectedHolding = (holdingId) => { selectedHolding.value = holdingId; };

    const formatFollowUp = (fu) => {
      const answers = fu.answers
        .filter(a => !selectedTrainer.value || (get(a, 'course.trainer') === selectedTrainer.value))
        .filter(a => !selectedCompany.value || (a.traineeCompany === selectedCompany.value))
        .filter(a => !selectedProgram.value || (get(a, 'course.subProgram.program._id') === selectedProgram.value))
        .filter(a => !selectedHolding.value ||
          ((holdingCompanies.value[selectedHolding.value]).includes(a.traineeCompany)));

      return { ...fu, answers: answers.map(a => a.answer) };
    };

    const resetFilters = () => {
      selectedTrainer.value = '';
      selectedCompany.value = '';
      selectedProgram.value = '';
      selectedHolding.value = '';
    };

    const created = async () => {
      await Promise.all([
        getQuestionnaireAnswers(),
        getTrainerOptions(),
        getCompanyOptions(),
        getProgramOptions(),
        getHoldingOptions(),
      ]);
    };

    created();

    return {
      // Data
      questionnaireAnswers,
      selectedTrainer,
      trainerOptions,
      selectedCompany,
      companyOptions,
      selectedProgram,
      programOptions,
      selectedHolding,
      holdingOptions,
      // Computed
      filteredAnswers,
      // Methods
      getQuestionnaireAnswers,
      getTrainerOptions,
      getCompanyOptions,
      getProgramOptions,
      updateSelectedTrainer,
      updateSelectedCompany,
      updateSelectedProgram,
      updateSelectedHolding,
      resetFilters,
    };
  },
};
</script>

<style lang="sass" scoped>
.filters-container
    grid-template-columns: repeat(4, 22%) 16%
    @media screen and (max-width: 767px)
      width: 95%
</style>
