<template>
  <div>
    <template v-if="isRofOrVendorAdmin">
      <div class="flex justify-end">
        <ni-primary-button class="q-mb-md" label="Exporter les réponses" unelevated icon="import_export"
          @click="exportAnswers" />
      </div>
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
    </template>
    <template v-if="hasFilteredAnswers">
      <q-card v-for="(card, cardIndex) of cards" :key="cardIndex" flat class="q-mb-sm">
        <component :is="getChartComponent(card.template)" :card="card" />
      </q-card>
    </template>
    <template v-else>
      <span class="text-italic">Aucune réponse ne correspond aux filtres sélectionnés</span>
    </template>
  </div>
</template>

<script>
import { computed, toRefs, ref, watch, nextTick } from 'vue';
import { useStore } from 'vuex';
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
import { formatAndSortIdentityOptions, formatAndSortOptions, formatStringForExport } from '@helpers/utils';
import { composeCourseName } from '@helpers/courses';
import CompaniDate from '@helpers/dates/companiDates';
import { downloadCsv } from '@helpers/file';
import { NotifyNegative } from '@components/popup/notify';
import PrimaryButton from '@components/PrimaryButton';
import { questionnaireAnswersMixin } from '@mixins/questionnaireAnswersMixin';
import {
  TRAINER,
  TRAINING_ORGANISATION_MANAGER,
  VENDOR_ADMIN,
  INTRA,
  INTRA_HOLDING,
  YES,
  NO,
  SURVEY,
  OPEN_QUESTION,
  DD_MM_YYYY,
  NO_DATA,
  QUESTION_ANSWER,
} from '@data/constants';

export default {
  name: 'ProfileAnswers',
  components: {
    'ni-select': Select,
    'ni-primary-button': PrimaryButton,
  },
  mixins: [questionnaireAnswersMixin],
  props: {
    profileId: { type: String, required: true },
    hideProgramFilter: { type: Boolean, default: false },
    course: { type: Object, default: () => ({}) },
  },
  setup (props) {
    const { profileId, course } = toRefs(props);

    const $store = useStore();

    const loggedUser = computed(() => $store.state.main.loggedUser);

    const isRofOrVendorAdmin = computed(() => [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER]
      .includes(loggedUser.value.role.vendor.name));

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
    const selectedCourses = ref(get(course.value, '_id') ? [course.value._id] : []);

    const filteredAnswers = computed(() => {
      if (!get(questionnaireAnswers.value, 'followUp')) return {};

      return { ...questionnaireAnswers.value, followUp: questionnaireAnswers.value.followUp.map(formatFollowUp) };
    });

    const hasFilteredAnswers = computed(() => get(filteredAnswers.value, 'followUp', [])
      .flatMap(a => a.answers).length > 0);

    const displayCourseSelect = computed(() => (selectedTrainer.value || selectedCompany.value ||
      selectedHolding.value || selectedProgram.value) && !!hasFilteredAnswers.value);

    const courseOptions = computed(() => {
      const options = [];

      if (displayCourseSelect.value && get(filteredAnswers.value, 'followUp')) {
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

    const cards = computed(() => get(filteredAnswers.value, 'followUp', [])
      .map(fu => ({ ...fu, answers: fu.answers.map(a => a.answer) })));

    const getQuestionnaireAnswers = async () => {
      try {
        const query = isRofOrVendorAdmin.value ? {} : { course: course.value._id };
        questionnaireAnswers.value = await Questionnaires.getQuestionnaireAnswers(profileId.value, query);
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
        answers,
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

    const getTraineeAnswer = (followUp, answer) => {
      if ([SURVEY, OPEN_QUESTION].includes(followUp.template)) return formatStringForExport(answer);
      if (followUp.template === QUESTION_ANSWER) return get(followUp.qcAnswers.find(a => a._id === answer), 'text');

      return '';
    };

    const getCsvName = () => {
      let fileName = `Réponses_questionnaire_${CompaniDate().format(DD_MM_YYYY)}`;

      if (selectedTrainer.value) {
        const trainer = trainerOptions.value.find(t => t.value === selectedTrainer.value).label;
        fileName += `_${trainer}`;
      }
      if (selectedCompany.value) {
        const company = companyOptions.value.find(c => c.value === selectedCompany.value).label;
        fileName += `_${company}`;
      }
      if (selectedProgram.value) {
        const program = programOptions.value.find(p => p.value === selectedProgram.value).label;
        fileName += `_${program}`;
      }
      if (selectedHolding.value) {
        const holding = holdingOptions.value.find(h => h.value === selectedHolding.value).label;
        fileName += `_${holding}`;
      }

      return fileName;
    };

    const exportAnswers = () => {
      const answersRowsToExport = [];
      if (filteredAnswers.value.followUp.length) {
        for (const fu of filteredAnswers.value.followUp) {
          for (const a of fu.answers) {
            answersRowsToExport.push({
              Question: formatStringForExport(fu.question),
              'Question à choix multiples': fu.isQuestionAnswerMultipleChoiced ? YES : NO,
              'Date de réponse': CompaniDate(a.createdAt).format(DD_MM_YYYY),
              'Réponse de l\'apprenant': getTraineeAnswer(fu, a.answer),
              'Id de la formation': get(a, 'course._id'),
            });
          }
        }
      }

      const fileName = getCsvName();

      return downloadCsv(
        answersRowsToExport.length
          ? [Object.keys(answersRowsToExport[0]), ...answersRowsToExport.map(a => Object.values(a))]
          : [[NO_DATA]],
        `${fileName}.csv`
      );
    };

    const created = async () => {
      if (isRofOrVendorAdmin.value) {
        await Promise.all([
          getQuestionnaireAnswers(),
          getTrainerOptions(),
          getCompanyOptions(),
          getProgramOptions(),
          getHoldingOptions(),
        ]);

        if (get(course.value, '_id')) {
          selectedTrainer.value = course.value.trainer._id;
          selectedCompany.value = course.value.type === INTRA ? course.value.companies[0]._id : '';
          selectedProgram.value = course.value.subProgram.program._id;
          selectedHolding.value = course.value.type === INTRA_HOLDING ? course.value.holding : '';
          await nextTick();
          selectedCourses.value = [course.value._id];
        }
      } else {
        await getQuestionnaireAnswers();

        if (get(course.value, '_id')) selectedCourses.value = [course.value._id];
      }
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
      exportAnswers,
      // Computed
      filteredAnswers,
      displayCourseSelect,
      courseOptions,
      isRofOrVendorAdmin,
      hasFilteredAnswers,
      cards,
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
