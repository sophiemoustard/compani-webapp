<template>
  <div>
    <div class="q-mb-xl">
      <div class="row">
        <p class="text-weight-bold table-title">{{ tableTitle }}</p>
      </div>
      <div class="row" v-if="isIntraCourse">
        <ni-input v-if="isRofOrAdmin && !isClientInterface" caption="Nombre max de stagiaires" :disable="isArchived"
          :model-value="maxTrainees" @update:model-value="inputTmpMaxTrainees($event)"
          :error="validations.maxTrainees.$error" :error-message="maxTraineesErrorMessage" @blur="updateMaxTrainees" />
        <div v-else class="q-mb-sm">{{ maxTrainees }} stagiaires max</div>
      </div>
      <q-card>
        <div v-if="!hasLinkedCompanies" class="text-center text-italic no-data">
          Aucune structure n'est rattachée à cette formation
        </div>
        <ni-trainee-table v-else :trainees="course.trainees" :can-edit="canEdit" @refresh="refresh"
          :loading="loading" table-class="q-pb-md" />
      </q-card>
      <div align="right" v-if="canEdit" class="q-pa-sm">
        <ni-button v-if="!isIntraCourse" color="primary" icon="add" label="Rattacher une structure" :disable="loading"
          @click="openCompanyAdditionModal" />
        <ni-button color="primary" icon="add" label="Ajouter une personne" :disable="loading"
          @click="openTraineeCreationModal" />
      </div>
    </div>

    <user-addition-modal v-model="traineeAdditionModal" v-model:new-user-registration="newTraineeRegistration"
      @submit="addTrainee" :validations="traineeRegistrationValidation.newTraineeRegistration"
      :loading="traineeModalLoading" @hide="resetTraineeAdditionForm" :users-options="traineesOptions"
      @open-user-creation-modal="openLearnerCreationModal" :users-company-options="traineesCompanyOptions"
      :display-company-select="!isIntraCourse" display-no-options-slot label="Stagiaire" />

    <learner-creation-modal v-model="learnerCreationModal" v-model:new-user="newLearner"
      @hide="resetLearnerCreationModal" :first-step="firstStep" @next-step="nextStepLearnerCreationModal"
      :company-options="companyOptions" :disable-company="isIntraCourse" :learner-edition="learnerAlreadyExists"
      :validations="learnerValidation.newLearner" :loading="learnerCreationModalLoading"
      @submit="submitLearnerCreationModal" :disable-user-info="disableUserInfoEdition" />

    <company-addition-modal v-model="companyAdditionModal" v-model:selected-company="selectedCompany"
      @submit="addCompany" :validations="companyValidation.selectedCompany" :loading="companyModalLoading"
      @hide="resetCompanyAdditionModal" :company-options="selectCompanyOptions" />
  </div>
</template>

<script>
import { computed, ref, toRefs } from 'vue';
import { useStore } from 'vuex';
import get from 'lodash/get';
import Courses from '@api/Courses';
import { TRAINER } from '@data/constants';
import { formatAndSortUserOptions, formatAndSortOptions } from '@helpers/utils';
import { getCurrentAndFutureCompanies } from '@helpers/userCompanies';
import Button from '@components/Button';
import Input from '@components/form/Input';
import UserAdditionModal from '@components/courses/UserAdditionModal';
import LearnerCreationModal from '@components/courses/LearnerCreationModal';
import TraineeTable from '@components/courses/TraineeTable';
import CompanyAdditionModal from '@components/courses/CompanyAdditionModal';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { useLearnersCreation } from '@composables/learnersCreation';
import { useCourses } from '@composables/courses';
import { useCompaniesCoursesLink } from '@composables/companiesCoursesLink';

export default {
  name: 'TraineeContainer',
  props: {
    canEdit: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    maxTrainees: { type: [Number, String], default: '' },
    potentialTrainees: { type: Array, default: () => [] },
  },
  components: {
    'ni-button': Button,
    'ni-input': Input,
    'ni-trainee-table': TraineeTable,
    'user-addition-modal': UserAdditionModal,
    'learner-creation-modal': LearnerCreationModal,
    'company-addition-modal': CompanyAdditionModal,
  },
  emits: ['refresh', 'update', 'update:maxTrainees'],
  setup (props, { emit }) {
    const { canEdit, validations, potentialTrainees } = toRefs(props);

    const $store = useStore();

    const traineeModalLoading = ref(false);

    const vendorRole = computed(() => $store.getters['main/getVendorRole']);

    const isTrainer = ref(vendorRole.value === TRAINER);

    const course = computed(() => $store.state.course.course);

    const traineesNumber = computed(() => (course.value.trainees ? course.value.trainees.length : 0));

    const tableTitle = computed(() => (canEdit.value || isTrainer.value
      ? `Stagiaires (${traineesNumber.value})`
      : `Stagiaires de votre structure (${traineesNumber.value})`));

    const traineesOptions = computed(() => formatAndSortUserOptions(potentialTrainees.value, !isIntraCourse.value));

    const maxTraineesErrorMessage = computed(() => {
      if (get(validations.value, 'maxTrainees.strictPositiveNumber.$response') === false ||
        get(validations.value, 'maxTrainees.integerNumber.$response') === false) {
        return 'Nombre non valide';
      }
      return '';
    });

    const companyOptions = computed(() => formatAndSortOptions(course.value.companies, 'name'));

    const companyVisibleColumns = computed(() => (canEdit.value ? ['company', 'actions'] : ['company']));

    const courseCompanyIds = computed(() => course.value.companies.map(c => c._id));

    const hasLinkedCompanies = computed(() => !!course.value.companies.length);

    const traineesCompanyOptions = computed(() => {
      const options = {};
      for (let i = 0; i < potentialTrainees.value.length; i++) {
        const currentAndFutureCompanyList = getCurrentAndFutureCompanies(potentialTrainees.value[i].userCompanyList);
        options[potentialTrainees.value[i]._id] = currentAndFutureCompanyList
          .filter(company => courseCompanyIds.value.includes(company._id))
          .map(company => ({ label: company.name, value: company._id }));
      }
      return options;
    });

    const refresh = () => emit('refresh');

    const { isIntraCourse, isClientInterface, isArchived } = useCourses(course);

    const {
      newLearner,
      newTraineeRegistration,
      traineeAdditionModal,
      learnerCreationModal,
      learnerCreationModalLoading,
      firstStep,
      learnerAlreadyExists,
      isRofOrAdmin,
      learnerValidation,
      traineeRegistrationValidation,
      nextStepLearnerCreationModal,
      submitLearnerCreationModal,
      resetLearnerCreationModal,
      tableLoading,
      disableUserInfoEdition,
    } = useLearnersCreation(refresh, isClientInterface, false, courseCompanyIds, !isIntraCourse.value);

    const {
      selectedCompany,
      companyAdditionModal,
      companyValidation,
      companyModalLoading,
      resetCompanyAdditionModal,
      openCompanyAdditionModal,
      addCompany,
      selectCompanyOptions,
      validateCompanyDeletion,
      getPotentialCompanies,
    } = useCompaniesCoursesLink(course, emit);

    const resetTraineeAdditionForm = () => {
      newTraineeRegistration.value = {};
      traineeRegistrationValidation.value.newTraineeRegistration.$reset();
    };
    const addTrainee = async () => {
      try {
        traineeModalLoading.value = true;
        traineeRegistrationValidation.value.newTraineeRegistration.$touch();
        if (traineeRegistrationValidation.value.newTraineeRegistration.$error) {
          return NotifyWarning('Champ(s) invalide(s)');
        }

        const payload = {
          trainee: newTraineeRegistration.value.user,
          ...(!isIntraCourse.value && { company: newTraineeRegistration.value.company }),
        };
        await Courses.addTrainee(course.value._id, payload);

        traineeAdditionModal.value = false;
        refresh();
        NotifyPositive('Stagiaire ajouté(e).');
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        if (e.status === 403) return NotifyWarning(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout du/de la stagiaire.');
      } finally {
        traineeModalLoading.value = false;
      }
    };
    const openTraineeCreationModal = () => {
      if (course.value.archivedAt) {
        return NotifyWarning('Vous ne pouvez pas ajouter de stagiaire à une formation archivée.');
      }

      traineeAdditionModal.value = true;
    };
    const openLearnerCreationModal = async () => {
      traineeAdditionModal.value = false;
      learnerCreationModal.value = true;
    };

    const updateMaxTrainees = () => emit('update');

    const inputTmpMaxTrainees = event => emit('update:maxTrainees', event);

    const created = async () => { await getPotentialCompanies(); };

    created();

    return {
      // Data
      newLearner,
      firstStep,
      learnerCreationModalLoading,
      learnerCreationModal,
      learnerAlreadyExists,
      traineeAdditionModal,
      newTraineeRegistration,
      traineeModalLoading,
      companyOptions,
      companyVisibleColumns,
      companyAdditionModal,
      selectedCompany,
      selectCompanyOptions,
      companyModalLoading,
      disableUserInfoEdition,
      // Validations
      learnerValidation,
      traineeRegistrationValidation,
      companyValidation,
      tableLoading,
      // Computed
      tableTitle,
      traineesOptions,
      course,
      isIntraCourse,
      isClientInterface,
      isArchived,
      isRofOrAdmin,
      maxTraineesErrorMessage,
      courseCompanyIds,
      hasLinkedCompanies,
      traineesCompanyOptions,
      // Methods
      nextStepLearnerCreationModal,
      submitLearnerCreationModal,
      resetLearnerCreationModal,
      resetTraineeAdditionForm,
      addTrainee,
      openTraineeCreationModal,
      openLearnerCreationModal,
      updateMaxTrainees,
      inputTmpMaxTrainees,
      refresh,
      openCompanyAdditionModal,
      addCompany,
      resetCompanyAdditionModal,
      validateCompanyDeletion,
    };
  },
};
</script>

<style lang="sass" scoped>
.table-title
  flex: 1
.company
  border-top: 1px solid $copper-grey-200
.no-data
  font-size: 13px
  padding: 12px 0px 12px 0px
.q-table
  & tbody
    & td
      height: 25px
      padding: 12px 0px 0px 4px
</style>
