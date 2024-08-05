<template>
  <div>
    <div class="filters-container">
      <ni-select :options="trainerOptions" :model-value="selectedTrainer" @update:model-value="updateSelectedTrainer"
        clearable />
      <ni-select :options="companyOptions" :model-value="selectedCompany" @update:model-value="updateSelectedCompany"
        clearable />
      <ni-select v-if="!hideProgramFilter" :options="programOptions" :model-value="selectedProgram"
        @update:model-value="updateSelectedProgram" clearable />
      <ni-select :options="holdingOptions" :model-value="selectedHolding" @update:model-value="updateSelectedHolding"
        clearable />
    </div>
    <div class="group-filter-container">
      <ni-select v-if="displayCourseSelect" caption="Groupe de formation" :options="courseOptions"
        :model-value="selectedCourses" @update:model-value="updateSelectedCourses" clearable multiple
        :blur-on-selection="false" use-chips />
      <div class="reset-filters" @click="resetFilters">Effacer les filtres</div>
    </div>
    <q-card v-for="(card, cardIndex) of filteredAnswers.followUp" :key="cardIndex" flat class="q-mb-sm">
      <component :is="getChartComponent(card.template)" :card="card" />
    </q-card>
  </div>
</template>

<script>
import { computed, toRefs, ref, watch } from 'vue';
import get from 'lodash/get';
import uniq from 'lodash/uniq';
import keyBy from 'lodash/keyBy';
import uniqBy from 'lodash/uniqBy';
import mapValues from 'lodash/mapValues';
import Questionnaires from '@api/Questionnaires';
import Holdings from '@api/Holdings';
import Users from '@api/Users';
import Companies from '@api/Companies';
import Programs from '@api/Programs';
import Select from '@components/form/Select';
import { formatAndSortIdentityOptions, formatAndSortOptions } from '@helpers/utils';
import { composeCourseName } from '@helpers/courses';
import { NotifyNegative } from '@components/popup/notify';
import { questionnaireAnswersMixin } from '@mixins/questionnaireAnswersMixin';
import { TRAINER, TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN, INTRA, INTRA_HOLDING } from '@data/constants';

export default {
  name: 'ProfileAnswers',
  components: {
    'ni-select': Select,
  },
  mixins: [questionnaireAnswersMixin],
  props: {
    profileId: { type: String, required: true },
    hideProgramFilter: { type: Boolean, default: false },
    course: { type: Object, default: () => ({}) },
  },
  setup (props) {
    const { profileId, course } = toRefs(props);
    const questionnaireAnswers = ref({});
    const selectedTrainer = ref(get(course.value, 'trainer._id') || '');
    const trainerOptions = ref([]);
    const selectedCompany = ref(get(course.value, 'type') === INTRA ? get(course.value, 'companies[0]._id') : '');
    const companyOptions = ref([]);
    const selectedProgram = ref(get(course.value, 'subProgram.program._id') || '');
    const programOptions = ref([]);
    const selectedHolding = ref(get(course.value, 'type') === INTRA_HOLDING ? get(course.value, 'holding') : '');
    const holdingOptions = ref([]);
    const holdingCompanies = ref([]);
    const selectedCourses = ref(get(course.value, '_id') ? [course.value._id] : []);

    const filteredAnswers = computed(() => {
      if (!get(questionnaireAnswers.value, 'followUp')) return {};

      return { ...questionnaireAnswers.value, followUp: questionnaireAnswers.value.followUp.map(formatFollowUp) };
    });

    const displayCourseSelect = computed(() => selectedTrainer.value || selectedCompany.value ||
      selectedHolding.value || selectedProgram.value || false);

    const courseOptions = computed(() => {
      const options = [];

      if (displayCourseSelect.value) {
        const answers = questionnaireAnswers.value.followUp.map(fu => fu.answers
          .filter(a => !selectedTrainer.value || (get(a, 'course.trainer') === selectedTrainer.value))
          .filter(a => !selectedCompany.value || (a.traineeCompany === selectedCompany.value))
          .filter(a => !selectedProgram.value || (get(a, 'course.subProgram.program._id') === selectedProgram.value))
          .filter(a => !selectedHolding.value ||
            ((holdingCompanies.value[selectedHolding.value]).includes(a.traineeCompany))))
          .flat();

        options.push(...uniqBy(
          answers.map(a => ({ _id: a.course._id, name: composeCourseName(a.course, true) })),
          'name'
        ));
      }

      return formatAndSortOptions(options, 'name');
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
        holdingOptions.value = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des programmes.');
      }
    };

    const updateSelectedTrainer = (trainerId) => { selectedTrainer.value = trainerId; };

    const updateSelectedCompany = (companyId) => { selectedCompany.value = companyId; };

    const updateSelectedProgram = (programId) => { selectedProgram.value = programId; };

    const updateSelectedHolding = (holdingId) => { selectedHolding.value = holdingId; };

    const updateSelectedCourses = (courseIds) => { selectedCourses.value = courseIds; };

    const formatFollowUp = (fu) => {
      const answers = fu.answers
        .filter(a => !selectedTrainer.value || (get(a, 'course.trainer') === selectedTrainer.value))
        .filter(a => !selectedCompany.value || (a.traineeCompany === selectedCompany.value))
        .filter(a => !selectedProgram.value || (get(a, 'course.subProgram.program._id') === selectedProgram.value))
        .filter(a => !selectedHolding.value ||
          ((holdingCompanies.value[selectedHolding.value]).includes(a.traineeCompany)))
        .filter(a => !selectedCourses.value.length || (selectedCourses.value.includes(get(a, 'course._id'))));

      return {
        ...fu,
        answers: answers.map(a => a.answer),
        traineeCount: uniq(answers.map(a => a.trainee)).length,
        historyCount: uniq(answers.map(a => a.history)).length,
      };
    };

    const resetFilters = () => {
      selectedTrainer.value = '';
      selectedCompany.value = '';
      selectedProgram.value = '';
      selectedHolding.value = '';
      selectedCourses.value = [];
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

    watch(profileId, async () => {
      await created();
      if (!course.value) resetFilters();
    });

    watch(selectedCompany, () => updateSelectedCourses([]));
    watch(selectedHolding, () => updateSelectedCourses([]));
    watch(selectedProgram, () => updateSelectedCourses([]));
    watch(selectedTrainer, () => updateSelectedCourses([]));

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
      selectedCourses,
      // Computed
      filteredAnswers,
      displayCourseSelect,
      courseOptions,
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
      updateSelectedCourses,
    };
  },
};
</script>

<style lang="sass" scoped>
.filters-container
  display: grid
  grid-auto-flow: column
  grid-template-columns: auto
  @media screen and (max-width: 767px)
    grid-auto-flow: row
    grid-template-rows: auto

.group-filter-container
  flex-direction: column
  @media screen and (max-width: 767px)
    width: 95%
</style>
