<template>
  <div>
    <div class="q-mb-xl">
      <div class="row">
        <p class="text-weight-bold table-title">{{ tableTitle }}</p>
      </div>
      <div class="row" v-if="isIntraCourse || isIntraHoldingCourse">
        <ni-input v-if="isRofOrAdmin && !isClientInterface" caption="Nombre max de stagiaires" :disable="isArchived"
          :model-value="maxTrainees" @update:model-value="inputTmpMaxTrainees($event)"
          :error="validations.maxTrainees.$error" :error-message="maxTraineesErrorMessage" @blur="updateMaxTrainees" />
        <div v-else class="q-mb-sm">{{ maxTrainees }} stagiaires max</div>
      </div>
      <q-card>
        <div v-if="!hasLinkedCompanies" class="text-center text-italic no-data">
          Aucune structure n'est rattachée à cette formation
        </div>
        <div v-else-if="displayCompanyNames">
          <q-table :columns="traineeColumns" hide-bottom :visible-columns="traineeVisibleColumns" flat
            class="table-responsive q-px-md q-mt-md">
            <template #header="props">
              <slot name="header" :props="props">
                <q-tr :props="props">
                  <q-th v-for="col in props.cols" :key="col.name" :props="props" :style="col.style"
                    :class="[{ 'table-actions-responsive': col.name === 'actions' }]">
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </slot>
            </template>
          </q-table>
          <ni-expanding-table :data="course.companies" custom-class="q-pb-md q-px-md"
            :columns="companyColumns" :visible-columns="companyVisibleColumns" hide-header :expanded="courseCompanyIds"
            separator="none" hide-bottom :loading="loading" v-model:pagination="companyPagination">
            <template #row="{ props }">
              <q-td v-for="col in props.cols" :key="col.name" :props="props"
                :class="[col.class, { 'company': props.rowIndex !== 0}]">
                <template v-if="col.name === 'company'">
                  <div v-if="canAccessCompany" class="company-name-container" @click="goToCompany(col.value)">
                    {{ col.value }}
                  </div>
                  <div v-else>{{ col.value }}</div>
                </template>
                <template v-else-if="col.name === 'actions'">
                  <ni-button v-if="canUpdateCompanies && !traineesGroupedByCompanies[props.row._id]"
                    icon="close" @click="validateCompanyDeletion(col.value)" :disable="!!course.archivedAt" />
                </template>
              </q-td>
            </template>
            <template #expanding-row="{ props }">
              <div class="table-content">
                <ni-trainee-table v-if="!!traineesGroupedByCompanies[props.row._id]" @refresh="refresh" hide-header
                  :columns="traineeColumns" :visible-columns="traineeVisibleColumns"
                  :trainees="traineesGroupedByCompanies[props.row._id]" table-class="trainee-table" />
                <div class="text-center text-italic no-data" v-else>
                  Aucun(e) apprenant(e) de cette structure n'a été ajouté(e)
                </div>
              </div>
            </template>
          </ni-expanding-table>
        </div>
        <ni-trainee-table v-else :trainees="course.trainees" @refresh="refresh" :loading="loading"
          table-class="q-pb-md" :columns="traineeColumns" :visible-columns="traineeVisibleColumns" />
      </q-card>
      <div align="right" v-if="canUpdateTrainees" class="q-pa-sm">
        <ni-button v-if="canUpdateCompanies" color="primary" icon="add" label="Rattacher une structure"
          :disable="loading" @click="openCompanyAdditionModal" />
        <ni-button v-if="course.companies.length" color="primary" icon="add" label="Ajouter une personne"
          :disable="loading" @click="openTraineeCreationModal" />
        <ni-button v-if="course.hasCertifyingTest && canUpdateCertifyingTest" color="primary" icon="edit"
          label="Modifier les certifications" :disable="loading" @click="openCertificationsUpdateModal" />
      </div>
    </div>

    <user-addition-modal v-model="traineeAdditionModal" v-model:new-user-registration="newTraineeRegistration"
      @submit="addTrainee" :validations="traineeRegistrationValidation.newTraineeRegistration"
      :loading="traineeModalLoading" @hide="resetTraineeAdditionForm" :users-options="traineesOptions"
      @open-user-creation-modal="openLearnerCreationModal" :users-company-options="traineesCompanyOptions"
      :display-company-select="!isIntraCourse" display-no-options-slot label="Stagiaire"
      :display-is-certified="course.hasCertifyingTest && canUpdateCertifyingTest" />

    <learner-creation-modal v-model="learnerCreationModal" v-model:new-user="newLearner"
      @hide="resetLearnerCreationModal" :first-step="firstStep" @next-step="nextStepLearnerCreationModal"
      :company-options="companyOptions" :disable-company="isIntraCourse" :learner-edition="learnerAlreadyExists"
      :validations="learnerValidation.newLearner" :loading="learnerCreationModalLoading"
      @submit="submitLearnerCreationModal" :disable-user-info="disableUserInfoEdition" />

    <company-addition-modal v-model="companyAdditionModal" v-model:selected-company="selectedCompany"
      @submit="addCompany" :validations="companyValidation.selectedCompany" :loading="companyModalLoading"
      @hide="resetCompanyAdditionModal" :company-options="selectCompanyOptions" />

    <certifications-update-modal v-model="certificationsUpdateModal" @hide="resetCertificationUpdateModal"
      v-model:certified-trainees="editedCertifications" :trainee-options="traineeOptions"
      :loading="certificationUpdateLoading" @submit="updateCertifications" />
  </div>
</template>

<script>
import { subject } from '@casl/ability';
import { computed, ref, toRefs } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import get from 'lodash/get';
import pick from 'lodash/pick';
import groupBy from 'lodash/groupBy';
import Courses from '@api/Courses';
import { TRAINER, INTRA } from '@data/constants';
import { defineAbilitiesForCourse } from '@helpers/ability';
import {
  formatAndSortUserOptions,
  formatAndSortOptions,
  formatAndSortIdentityOptions,
  formatPhone,
} from '@helpers/utils';
import { getCurrentAndFutureCompanies } from '@helpers/userCompanies';
import Button from '@components/Button';
import Input from '@components/form/Input';
import UserAdditionModal from '@components/courses/UserAdditionModal';
import LearnerCreationModal from '@components/courses/LearnerCreationModal';
import TraineeTable from '@components/courses/TraineeTable';
import ExpandingTable from '@components/table/ExpandingTable';
import CompanyAdditionModal from '@components/courses/CompanyAdditionModal';
import CertificationsUpdateModal from '@components/courses/CertificationsUpdateModal';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { useLearnersCreation } from '@composables/learnersCreation';
import { useCourses } from '@composables/courses';
import { useCompaniesCoursesLink } from '@composables/companiesCoursesLink';

export default {
  name: 'TraineeContainer',
  props: {
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
    'ni-expanding-table': ExpandingTable,
    'company-addition-modal': CompanyAdditionModal,
    'certifications-update-modal': CertificationsUpdateModal,
  },
  emits: ['refresh', 'update', 'update:maxTrainees'],
  setup (props, { emit }) {
    const { validations, potentialTrainees } = toRefs(props);

    const $store = useStore();
    const $router = useRouter();

    const editedCertifications = ref([]);
    const certificationsUpdateModal = ref(false);
    const certificationUpdateLoading = ref(false);

    const canUpdateTrainees = ref(false);
    const canUpdateCompanies = ref(false);
    const canAccessCompany = ref(false);
    const canAccessEveryTrainee = ref(false);
    const canUpdateCertifyingTest = ref(false);

    const traineeOptions = computed(() => formatAndSortIdentityOptions(course.value.trainees));

    const loggedUser = computed(() => $store.state.main.loggedUser);

    const course = computed(() => $store.state.course.course);

    const traineeModalLoading = ref(false);

    const companyColumns = computed(() => [
      {
        name: 'company',
        label: 'Structure',
        align: 'left',
        classes: canAccessCompany.value ? 'clickable-name cursor-pointer' : 'company-name',
        field: row => get(row, 'name') || '',
      },
      { name: 'actions', label: '', align: 'right', field: '_id', classes: 'company-action-container' },
    ]);

    const companyPagination = ref({ rowsPerPage: 0, sortBy: 'company' });

    const traineeColumns = computed(() => [
      {
        name: 'firstname',
        label: 'Prénom',
        align: 'left',
        field: row => get(row, 'identity.firstname') || '',
        classes: 'text-capitalize',
      },
      {
        name: 'lastname',
        label: 'Nom',
        align: 'left',
        field: row => get(row, 'identity.lastname') || '',
        classes: 'text-capitalize',
      },
      { name: 'email', label: 'Email', align: 'left', field: row => get(row, 'local.email') || '', classes: 'email' },
      {
        name: 'phone',
        label: 'Téléphone',
        align: 'left',
        field: row => get(row, 'contact.phone') || '',
        format: formatPhone,
      },
      {
        name: 'connectionInfos',
        label: 'Code de connexion à l\'app',
        field: 'loginCode',
        align: 'center',
      },
      ...course.value.hasCertifyingTest
        ? [{
          name: 'certification',
          label: 'Certification',
          field: row => get(course.value, 'certifiedTrainees', []).includes(row._id),
          format: value => (value ? 'Oui' : 'Non'),
          align: 'center',
        }]
        : [],
      { name: 'actions', label: '', align: 'right', field: '' },
    ]);

    const traineeVisibleColumns = computed(() => {
      const col = ['firstname', 'lastname', 'email', 'phone', 'connectionInfos', 'certification'];

      return canUpdateTrainees.value ? [...col, 'actions'] : col;
    });

    const vendorRole = computed(() => $store.getters['main/getVendorRole']);

    const isTrainer = ref(vendorRole.value === TRAINER);

    const traineesNumber = computed(() => (course.value.trainees ? course.value.trainees.length : 0));

    const tableTitle = computed(() => (canAccessEveryTrainee.value || isTrainer.value
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

    const traineesGroupedByCompanies = computed(() => groupBy(course.value.trainees, t => t.registrationCompany));

    const companyVisibleColumns = computed(() => (canUpdateCompanies.value ? ['company', 'actions'] : ['company']));

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

    const displayCompanyNames =
      computed(() => !isIntraCourse.value && (!isClientInterface || !!loggedUser.value.role.holding));

    const refresh = () => emit('refresh');

    const { isIntraCourse, isClientInterface, isArchived, isIntraHoldingCourse } = useCourses(course);

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

    const defineCourseAbilities = () => {
      const ability = defineAbilitiesForCourse(pick(loggedUser.value, ['role']));

      canUpdateTrainees.value = ability.can('update', subject('Course', course.value), 'trainees');
      canUpdateCompanies.value = ability.can('update', subject('Course', course.value), 'companies');
      canAccessCompany.value = ability.can('read', subject('Course', course.value), 'companies');
      canAccessEveryTrainee.value = ability.can('read', subject('Course', course.value), 'all_trainees');
      canUpdateCertifyingTest.value = ability.can('update', subject('Course', course.value), 'certifying_test');
    };

    const resetTraineeAdditionForm = () => {
      newTraineeRegistration.value = {
        user: '',
        ...(!isIntraCourse.value && { company: '' }),
        isCertified: false,
      };
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
          ...(newTraineeRegistration.value.isCertified && { isCertified: true }),
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

    const openCertificationsUpdateModal = () => {
      editedCertifications.value = course.value.certifiedTrainees;
      certificationsUpdateModal.value = true;
    };

    const resetCertificationUpdateModal = () => {
      editedCertifications.value = [];
    };

    const updateCertifications = async () => {
      try {
        certificationUpdateLoading.value = true;

        await Courses.update(course.value._id, { certifiedTrainees: editedCertifications.value });

        certificationsUpdateModal.value = false;
        refresh();
        NotifyPositive('Certifications modifiées.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification des certifications.');
      } finally {
        certificationUpdateLoading.value = false;
      }
    };

    const updateMaxTrainees = () => emit('update');

    const inputTmpMaxTrainees = event => emit('update:maxTrainees', event);

    const goToCompany = async (companyName) => {
      const companyId = course.value.companies.find(c => c.name === companyName)._id;
      $router.push({ name: 'ni users companies info', params: { companyId }, query: { defaultTab: 'infos' } });
    };

    const created = async () => {
      defineCourseAbilities();
      if (course.value.type !== INTRA && canUpdateCompanies.value) await getPotentialCompanies();
    };

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
      companyColumns,
      companyVisibleColumns,
      companyAdditionModal,
      selectedCompany,
      selectCompanyOptions,
      companyModalLoading,
      companyPagination,
      disableUserInfoEdition,
      canUpdateCompanies,
      canAccessCompany,
      canUpdateTrainees,
      canUpdateCertifyingTest,
      editedCertifications,
      certificationsUpdateModal,
      certificationUpdateLoading,
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
      isIntraHoldingCourse,
      isClientInterface,
      isArchived,
      isRofOrAdmin,
      maxTraineesErrorMessage,
      traineesGroupedByCompanies,
      courseCompanyIds,
      hasLinkedCompanies,
      traineesCompanyOptions,
      displayCompanyNames,
      traineeOptions,
      traineeColumns,
      traineeVisibleColumns,
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
      goToCompany,
      openCompanyAdditionModal,
      addCompany,
      resetCompanyAdditionModal,
      validateCompanyDeletion,
      openCertificationsUpdateModal,
      resetCertificationUpdateModal,
      updateCertifications,
    };
  },
};
</script>

<style lang="sass" scoped>
.table-title
  flex: 1
.company-name-container
  padding: 8px 24px
.company-name
  color: $primary
  width: fit-content
  cursor: default
.company
  border-top: 1px solid $copper-grey-200
.company-action-container
  width: 20%
.no-data
  font-size: 13px
  padding: 12px 12px
.q-table
  & tbody
    & td
      height: 25px
.table-actions-responsive
  width: 15%
.table-content
  width: 125% !important
</style>
