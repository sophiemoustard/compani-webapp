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
        <ni-expanding-table v-else-if="!isIntraCourse && !isClientInterface"
          :data="course.companies" :columns="companyColumns" :visible-columns="companyVisibleColumns" hide-header
          :expanded="courseCompanyIds" separator="none" hide-bottom :loading="tableLoading">
          <template #row="{ props }">
            <q-td v-for="col in props.cols" :key="col.name" :props="props"
              :class="[col.class, { 'company': props.rowIndex !== 0}]">
              <template v-if="col.name === 'company'">
                <div v-if="canEdit" @click="goToCompany(col.value)"> {{ col.value }}</div>
                <div v-else>{{ col.value }}</div>
              </template>
              <template v-else-if="col.name === 'actions'">
                <ni-button v-if="canEdit && !traineesGroupedByCompanies[props.row._id]"
                  icon="close" @click="validateCompanyDeletion(col.value)" :disable="!!course.archivedAt" />
              </template>
            </q-td>
          </template>
          <template #expanding-row="{ props }">
            <ni-trainee-table v-if="!!traineesGroupedByCompanies[props.row._id]"
              :trainees="traineesGroupedByCompanies[props.row._id]" :can-edit="canEdit"
              @refresh="refresh" hide-header />
            <div class="text-center text-italic no-data" v-else>
              Aucun(e) apprenant(e) de cette structure n'a été ajouté(e)
            </div>
          </template>
        </ni-expanding-table>
        <ni-trainee-table v-else :trainees="course.trainees" :can-edit="canEdit" @refresh="refresh" />
      </q-card>
      <q-card-actions align="right" v-if="canEdit">
        <ni-button v-if="!isIntraCourse" color="primary" icon="add" label="Rattacher une structure" :disable="loading"
          @click="openCompanyAdditionModal" />
        <ni-button color="primary" icon="add" label="Ajouter une personne" :disable="loading"
          @click="openTraineeCreationModal" />
      </q-card-actions>
    </div>

    <trainee-addition-modal v-model="traineeAdditionModal" v-model:new-trainee="newTrainee" @submit="addTrainee"
      :validations="traineeValidation.newTrainee" :loading="traineeModalLoading" @hide="resetTraineeAdditionForm"
      :trainees-options="traineesOptions" @open-learner-creation-modal="openLearnerCreationModal" />

    <learner-creation-modal v-model="learnerCreationModal" v-model:new-user="newLearner" display-company
      @hide="resetLearnerCreationModal" :first-step="firstStep" @next-step="nextStepLearnerCreationModal"
      :company-options="companyOptions" :disable-company="disableCompany" :learner-edition="learnerAlreadyExists"
      :validations="learnerValidation.newLearner" :loading="learnerCreationModalLoading"
      @submit="submitLearnerCreationModal" />

    <company-addition-modal v-model="companyAdditionModal" v-model:selected-company="selectedCompany"
      @submit="addCompany" :validations="companyValidation.selectedCompany" :loading="companyModalLoading"
      @hide="resetCompanyAdditionModal" :company-options="selectCompanyOptions" />
  </div>
</template>

<script>
import { computed, ref, toRefs } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import Users from '@api/Users';
import Courses from '@api/Courses';
import {
  TRAINER,
  DEFAULT_AVATAR,
  TRAINING_ORGANISATION_MANAGER,
  VENDOR_ADMIN,
  HELPER,
  AUXILIARY_WITHOUT_COMPANY,
} from '@data/constants';
import {
  formatIdentity,
  formatAndSortOptions,
} from '@helpers/utils';
import Button from '@components/Button';
import Input from '@components/form/Input';
import TraineeAdditionModal from '@components/courses/TraineeAdditionModal';
import LearnerCreationModal from '@components/courses/LearnerCreationModal';
import TraineeTable from '@components/courses/TraineeTable';
import ExpandingTable from '@components/table/ExpandingTable';
import CompanyAdditionModal from '@components/courses/CompanyAdditionModal';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { useLearners } from '@composables/learners';
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
    'trainee-addition-modal': TraineeAdditionModal,
    'learner-creation-modal': LearnerCreationModal,
    'ni-expanding-table': ExpandingTable,
    'company-addition-modal': CompanyAdditionModal,
  },
  emits: ['refresh', 'update', 'update:maxTrainees'],
  setup (props, { emit }) {
    const { canEdit, validations, potentialTrainees } = toRefs(props);

    const $store = useStore();
    const $router = useRouter();

    const traineeModalLoading = ref(false);

    const companyColumns = ref([
      {
        name: 'company',
        label: 'Structure',
        align: 'left',
        class: canEdit.value ? 'clickable-name' : 'company-name',
        field: row => get(row, 'name') || '',
      },
      { name: 'actions', label: '', align: 'left', field: '_id' },
    ]);

    const company = computed(() => $store.getters['main/getCompany']);

    const vendorRole = computed(() => $store.getters['main/getVendorRole']);

    const isTrainer = ref(vendorRole.value === TRAINER);

    const isRofOrAdmin = ref([TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN].includes(vendorRole.value));

    const course = computed(() => $store.state.course.course);

    const traineesNumber = computed(() => (course.value.trainees ? course.value.trainees.length : 0));

    const tableTitle = computed(() => (canEdit.value || isTrainer.value
      ? `Stagiaires (${traineesNumber.value})`
      : `Stagiaires de votre structure (${traineesNumber.value})`));

    const traineesOptions = computed(() => potentialTrainees.value
      .map(pt => ({
        value: pt._id,
        label: formatIdentity(pt.identity, 'FL'),
        email: pt.local.email || '',
        picture: get(pt, 'picture.link') || DEFAULT_AVATAR,
        ...(!isIntraCourse.value && { company: get(pt, 'company.name') || '' }),
        additionalFilters: [pt.local.email],
      }))
      .sort((a, b) => a.label.localeCompare(b.label)));

    const disableCompany = computed(() => isIntraCourse.value || userAlreadyHasCompany.value);

    const maxTraineesErrorMessage = computed(() => {
      if (get(validations.value, 'maxTrainees.strictPositiveNumber.$response') === false ||
        get(validations.value, 'maxTrainees.integerNumber.$response') === false) {
        return 'Nombre non valide';
      }
      return '';
    });

    const companyOptions = computed(() => formatAndSortOptions(course.value.companies, 'name'));

    const traineesGroupedByCompanies = computed(() => groupBy(course.value.trainees, t => t.company._id));

    const companyVisibleColumns = computed(() => (canEdit.value ? ['company', 'actions'] : ['company']));

    const courseCompanyIds = computed(() => course.value.companies.map(c => c._id));

    const hasLinkedCompanies = computed(() => !!course.value.companies.length);

    const refresh = () => emit('refresh');

    const {
      newLearner,
      newTrainee,
      traineeAdditionModal,
      learnerCreationModal,
      learnerCreationModalLoading,
      firstStep,
      userAlreadyHasCompany,
      learnerAlreadyExists,
      learnerValidation,
      traineeValidation,
      goToNextStep,
      submitLearnerCreationModal,
      resetLearnerCreationModal,
      tableLoading,
    } = useLearners(refresh, false, company);

    const { isIntraCourse, isClientInterface, isArchived } = useCourses(course);

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

    const setNewLearner = (user) => {
      newLearner.value._id = user._id;
      newLearner.value.identity = {
        firstname: get(user, 'identity.firstname'),
        lastname: get(user, 'identity.lastname'),
      };
      newLearner.value.contact = { phone: get(user, 'contact.phone') };

      if (get(user, 'company._id')) newLearner.value.company = get(user, 'company._id');
      else if (isIntraCourse.value) newLearner.value.company = course.value.companies[0]._id;
    };

    const nextStepLearnerCreationModal = async () => {
      try {
        learnerValidation.value.newLearner.$touch();
        if (learnerValidation.value.newLearner.local.email.$error) return NotifyWarning('Champ invalide.');

        learnerCreationModalLoading.value = true;
        const userInfo = await Users.exists({ email: newLearner.value.local.email });

        if (!userInfo.exists) {
          if (isIntraCourse.value) newLearner.value.company = course.value.companies[0]._id;

          return goToNextStep();
        }

        if (!get(userInfo, 'user._id')) {
          return NotifyNegative('L\'apprenant(e) existe déjà et n\'est pas relié(e) à la bonne structure.');
        }
        const user = await Users.getById(userInfo.user._id);

        const isHelperOrAuxiliaryWithoutCompany = [HELPER, AUXILIARY_WITHOUT_COMPANY]
          .includes(get(user, 'role.client.name'));
        if (isHelperOrAuxiliaryWithoutCompany && isIntraCourse.value) {
          return NotifyNegative('Cette personne ne peut pas être ajoutée à la formation.');
        }

        const companyIds = course.value.companies.map(c => c._id);
        if (get(user, 'company._id') && !companyIds.includes(user.company._id)) {
          return NotifyNegative('L\'apprenant(e) existe déjà et n\'est pas relié(e) à la bonne structure.');
        }

        setNewLearner(user);
        userAlreadyHasCompany.value = !!get(user, 'company._id');
        learnerAlreadyExists.value = true;

        return goToNextStep();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'ajout de l\'apprenant(e).');
      } finally {
        learnerCreationModalLoading.value = false;
      }
    };

    const resetTraineeAdditionForm = () => {
      newTrainee.value = '';
      traineeValidation.value.newTrainee.$reset();
    };
    const addTrainee = async () => {
      try {
        traineeModalLoading.value = true;
        traineeValidation.value.newTrainee.$touch();
        if (traineeValidation.value.newTrainee.$error) return NotifyWarning('Champ(s) invalide(s)');

        await Courses.addTrainee(course.value._id, { trainee: newTrainee.value });
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

    const goToCompany = async (companyName) => {
      const companyId = course.value.companies.find(c => c.name === companyName)._id;
      $router.push({ name: 'ni users companies info', params: { companyId, defaultTab: 'infos' } });
    };

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
      newTrainee,
      traineeModalLoading,
      companyOptions,
      companyColumns,
      companyVisibleColumns,
      companyAdditionModal,
      selectedCompany,
      selectCompanyOptions,
      companyModalLoading,
      // Validations
      learnerValidation,
      traineeValidation,
      companyValidation,
      tableLoading,
      // Computed
      tableTitle,
      traineesOptions,
      disableCompany,
      course,
      isIntraCourse,
      isClientInterface,
      isArchived,
      isRofOrAdmin,
      maxTraineesErrorMessage,
      traineesGroupedByCompanies,
      courseCompanyIds,
      hasLinkedCompanies,
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
    };
  },
};
</script>

<style lang="sass" scoped>
.table-title
  flex: 1
.company-name
  color: $primary
  width: fit-content
.company
  border-top: 1px solid $copper-grey-200
.no-data
  font-size: 12px
  padding: 12px 0px 12px 0px
.q-table
  & tbody
    & td
      height: 25px
      padding: 12px 0px 0px 4px
</style>
