<template>
  <div>
    <div class="q-mb-xl">
      <div class="row">
        <p class="text-weight-bold table-title">{{ tableTitle }}</p>
      </div>
      <div class="row" v-if="isIntraCourse">
        <ni-input v-if="isRofOrAdmin && !isClientInterface" caption="Nombre max de stagiaires" :disable="isArchived"
          v-model.trim="course.maxTrainees" @blur="updateMaxTrainees"
          :error="validations.maxTrainees.$error" :error-message="maxTraineesErrorMessage" />
        <div v-else class="q-mb-sm">{{ course.maxTrainees }} stagiaires max</div>
      </div>
      <q-card>
        <ni-responsive-table :data="course.trainees" :columns="traineesColumns" v-model:pagination="traineesPagination"
          :visible-columns="traineesVisibleColumns" :loading="tableLoading">
          <template #body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions">
                    <ni-button icon="edit" @click="openTraineeEditionModal(props.row)"
                      :disable="!!course.archivedAt" />
                    <ni-button icon="close" @click="validateTraineeDeletion(col.value)"
                      :disable="!!course.archivedAt" />
                  </div>
                </template>
                <template v-else-if="!isClientInterface && col.name === 'company'">
                  <div class="company-tag">{{ col.value }}</div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
        <q-card-actions align="right" v-if="canEdit">
          <ni-button color="primary" icon="add" label="Ajouter une personne" :disable="loading"
            @click="openTraineeCreationModal" />
        </q-card-actions>
      </q-card>
    </div>

    <trainee-addition-modal v-model="traineeAdditionModal" v-model:new-trainee="newTrainee" @submit="addTrainee"
      :validations="traineeValidation.newTrainee" :loading="traineeModalLoading" @hide="resetTraineeAdditionForm"
      :trainees-options="traineesOptions" @open-learner-creation-modal="openLearnerCreationModal" />

    <trainee-edition-modal v-model="traineeEditionModal" v-model:edited-trainee="editedTrainee" @submit="updateTrainee"
      @hide="resetTraineeEditionForm" :loading="traineeModalLoading" :validations="traineeValidation.editedTrainee" />

    <learner-creation-modal v-model="learnerCreationModal" v-model:new-user="newLearner" display-company
      @hide="resetLearnerCreationModal" :first-step="firstStep" @next-step="nextStepLearnerCreationModal"
      :company-options="companyOptions" :disable-company="disableCompany" :learner-edition="learnerAlreadyExists"
      :validations="learnerValidation.newLearner" :loading="learnerCreationModalLoading"
      @submit="submitLearnerCreationModal" />
  </div>
</template>

<script>
import { onMounted, computed, ref, toRefs } from 'vue';
import { useStore } from 'vuex';
import { useQuasar } from 'quasar';
import get from 'lodash/get';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import Users from '@api/Users';
import Companies from '@api/Companies';
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
  formatPhone,
  formatPhoneForPayload,
  formatIdentity,
  formatAndSortOptions,
} from '@helpers/utils';
import Button from '@components/Button';
import Input from '@components/form/Input';
import ResponsiveTable from '@components/table/ResponsiveTable';
import TraineeEditionModal from '@components/courses/TraineeEditionModal';
import TraineeAdditionModal from '@components/courses/TraineeAdditionModal';
import LearnerCreationModal from '@components/courses/LearnerCreationModal';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { useLearners } from '@composables/learners';
import { useCourses } from '@composables/courses';

export default {
  name: 'TraineeTable',
  props: {
    canEdit: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-button': Button,
    'ni-input': Input,
    'ni-responsive-table': ResponsiveTable,
    'trainee-edition-modal': TraineeEditionModal,
    'trainee-addition-modal': TraineeAdditionModal,
    'learner-creation-modal': LearnerCreationModal,
  },
  emits: ['refresh', 'update'],
  setup (props, { emit }) {
    const { canEdit, validations } = toRefs(props);

    const $store = useStore();
    const $q = useQuasar();

    const potentialTrainees = ref([]);
    const traineesColumns = ref([
      {
        name: 'company',
        label: 'Structure',
        align: 'left',
        field: row => get(row, 'company.name') || '',
        classes: 'text-capitalize company-tag-content',
      },
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
      { name: 'email', label: 'Email', align: 'left', field: row => get(row, 'local.email') || '' },
      {
        name: 'phone',
        label: 'Téléphone',
        align: 'left',
        field: row => get(row, 'contact.phone') || '',
        format: formatPhone,
      },
      { name: 'actions', label: '', align: 'left', field: '_id' },
    ]);
    const traineesPagination = ref({ rowsPerPage: 0, sortBy: 'lastname' });
    const traineeEditionModal = ref(false);
    const traineeModalLoading = ref(false);
    const companyOptions = ref([]);

    const company = computed(() => $store.getters['main/getCompany']);

    const vendorRole = computed(() => $store.getters['main/getVendorRole']);

    const course = computed(() => $store.state.course.course);

    const loggedUser = computed(() => $store.state.main.loggedUser);

    const isTrainer = computed(() => vendorRole.value === TRAINER);

    const isRofOrAdmin = computed(() => [TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN].includes(vendorRole.value));

    const traineesNumber = computed(() => (course.value.trainees ? course.value.trainees.length : 0));

    const tableTitle = computed(() => (canEdit.value || isTrainer.value
      ? `Stagiaires (${traineesNumber.value})`
      : `Stagiaires de votre structure (${traineesNumber.value})`));

    const traineesVisibleColumns = computed(() => {
      const visibleColumns = ['firstname', 'lastname', 'email', 'phone'];
      if (canEdit.value) visibleColumns.push('actions');

      return isIntraCourse.value ? visibleColumns : ['company', ...visibleColumns];
    });

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

    const getPotentialTrainees = async () => {
      try {
        let query;

        if (isClientInterface) query = { companies: [get(loggedUser.value, 'company._id')] };
        else query = { companies: course.value.companies.map(c => c._id) };

        potentialTrainees.value = query.companies.length ? Object.freeze(await Users.learnerList(query)) : [];
      } catch (error) {
        potentialTrainees.value = [];
        console.error(error);
      }
    };

    const refresh = async () => getPotentialTrainees();
    const {
      newLearner,
      newTrainee,
      traineeAdditionModal,
      editedTrainee,
      learnerCreationModal,
      learnerCreationModalLoading,
      firstStep,
      userAlreadyHasCompany,
      learnerAlreadyExists,
      tableLoading,
      learnerValidation,
      traineeValidation,
      goToNextStep,
      submitLearnerCreationModal,
      resetLearnerCreationModal,
    } = useLearners(refresh, false, company);

    const { isIntraCourse, isClientInterface, isArchived } = useCourses(course);

    onMounted(async () => {
      await getPotentialTrainees();
    });

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

        const user = await Users.getById(userInfo.user._id);

        const isHelperOrAuxiliaryWithoutCompany = [HELPER, AUXILIARY_WITHOUT_COMPANY]
          .includes(get(user, 'role.client.name'));
        if (isHelperOrAuxiliaryWithoutCompany && isIntraCourse.value) {
          return NotifyNegative('Cette personne ne peut pas être ajoutée à la formation.');
        }
        if (isIntraCourse.value && get(user, 'company._id') && user.company._id !== course.value.companies[0]._id) {
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
        emit('refresh');
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
    const openTraineeEditionModal = async (trainee) => {
      editedTrainee.value = {
        ...editedTrainee.value,
        ...pick(trainee, ['_id', 'identity.firstname', 'identity.lastname', 'local.email', 'contact.phone']),
      };
      traineeEditionModal.value = true;
    };
    const resetTraineeEditionForm = () => {
      traineeValidation.value.editedTrainee.$reset();
      editedTrainee.value = { identity: {}, local: {}, contact: {} };
    };
    const updateTrainee = async () => {
      try {
        traineeModalLoading.value = true;
        traineeValidation.value.editedTrainee.$touch();
        if (traineeValidation.value.editedTrainee.$error) return NotifyWarning('Champ(s) invalide(s)');
        if (get(editedTrainee.value, 'contact.phone')) {
          editedTrainee.value.contact.phone = formatPhoneForPayload(editedTrainee.value.contact.phone);
        }

        await Users.updateById(editedTrainee.value._id, omit(editedTrainee.value, ['_id', 'local']));
        traineeEditionModal.value = false;
        emit('refresh');
        NotifyPositive('Stagiaire modifié(e).');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification du/de la stagiaire.');
      } finally {
        traineeModalLoading.value = false;
      }
    };
    const validateTraineeDeletion = (traineeId) => {
      $q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir retirer le/la stagiaire de la formation&nbsp;?',
        html: true,
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => deleteTrainee(traineeId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    };
    const deleteTrainee = async (traineeId) => {
      try {
        await Courses.deleteTrainee(course.value._id, traineeId);
        emit('refresh');
        NotifyPositive('Stagiaire supprimé(e).');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du/de la stagiaire.');
      }
    };
    const openTraineeCreationModal = async () => {
      if (course.value.archivedAt) {
        return NotifyWarning('Vous ne pouvez pas ajouter de stagiaire à une formation archivée.');
      }
      await refresh();

      traineeAdditionModal.value = true;
    };
    const openLearnerCreationModal = async () => {
      traineeAdditionModal.value = false;
      learnerCreationModal.value = true;
      await refreshCompanies();
    };
    const refreshCompanies = async () => {
      try {
        const companies = await Companies.list();
        companyOptions.value = formatAndSortOptions(companies, 'name');
      } catch (e) {
        console.error(e);
        companyOptions.value = [];
      }
    };

    const updateMaxTrainees = () => emit('update');

    return {
      // Data
      newLearner,
      firstStep,
      tableLoading,
      learnerCreationModalLoading,
      learnerCreationModal,
      learnerAlreadyExists,
      traineeAdditionModal,
      newTrainee,
      editedTrainee,
      traineesColumns,
      traineesPagination,
      traineeEditionModal,
      traineeModalLoading,
      companyOptions,
      // Validations
      learnerValidation,
      traineeValidation,
      // Computed
      tableTitle,
      traineesVisibleColumns,
      traineesOptions,
      disableCompany,
      course,
      isIntraCourse,
      isClientInterface,
      isArchived,
      isRofOrAdmin,
      maxTraineesErrorMessage,
      // Methods
      nextStepLearnerCreationModal,
      submitLearnerCreationModal,
      resetLearnerCreationModal,
      resetTraineeAdditionForm,
      addTrainee,
      openTraineeEditionModal,
      resetTraineeEditionForm,
      updateTrainee,
      validateTraineeDeletion,
      openTraineeCreationModal,
      openLearnerCreationModal,
      updateMaxTrainees,
    };
  },
};
</script>

<style lang="sass" scoped>
.table-title
  flex: 1
.company-tag
  background-color: $copper-100
  border-radius: 8px
  color: $copper-700
  padding: 4px 8px
  margin: 4px 0px
  &-content
    display: flex
    flex-direction: row
    justify-content: space-between
    align-items: center
</style>
