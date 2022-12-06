<template>
  <ni-responsive-table :data="trainees" :columns="traineeColumns" v-model:pagination="traineePagination"
    :loading="tableLoading">
    <template #body="{ props }">
      <q-tr :props="props">
        <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
          :style="col.style">
          <template v-if="col.name === 'actions' && canEdit">
            <div class="row no-wrap table-actions">
              <ni-button icon="edit" @click="openTraineeEditionModal(props.row)" :disable="!!course.archivedAt" />
              <ni-button icon="close" @click="validateTraineeDeletion(col.value)" :disable="!!course.archivedAt" />
            </div>
          </template>
          <template v-else>{{ col.value }}</template>
        </q-td>
      </q-tr>
    </template>
  </ni-responsive-table>

   <trainee-edition-modal v-model="traineeEditionModal" v-model:edited-trainee="editedTrainee" @submit="updateTrainee"
      @hide="resetTraineeEditionForm" :loading="traineeModalLoading" :validations="traineeValidation.editedTrainee" />
</template>

<script>
import { computed, ref, toRefs } from 'vue';
import { useStore } from 'vuex';
import { useQuasar } from 'quasar';
import get from 'lodash/get';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import { formatPhone, formatPhoneForPayload } from '@helpers/utils';
import Courses from '@api/Courses';
import Users from '@api/Users';
import Button from '@components/Button';
import TraineeEditionModal from '@components/courses/TraineeEditionModal';
import ResponsiveTable from '@components/table/ResponsiveTable';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { useLearners } from '@composables/learners';

export default {
  name: 'TraineeTable',
  props: {
    trainees: { type: Array, default: () => [] },
    canEdit: { type: Boolean, default: false },
  },
  components: {
    'ni-button': Button,
    'ni-responsive-table': ResponsiveTable,
    'trainee-edition-modal': TraineeEditionModal,
  },
  emits: ['refresh'],
  setup (props, { emit }) {
    const { canEdit } = toRefs(props);

    const $q = useQuasar();
    const $store = useStore();

    const traineePagination = ref({ rowsPerPage: 0 });
    const traineeEditionModal = ref(false);
    const traineeModalLoading = ref(false);
    const traineeColumns = ref([
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

    const company = computed(() => $store.getters['main/getCompany']);

    const { editedTrainee, traineeValidation, tableLoading } = useLearners(emit('refresh'), false, company);

    const course = computed(() => $store.state.course.course);

    const traineeVisibleColumns = computed(() => {
      const col = ['firstname', 'lastname', 'email', 'phone'];

      return canEdit.value ? [...col, 'actions'] : col;
    });

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

    return {
      // Data
      traineeColumns,
      traineePagination,
      traineeEditionModal,
      editedTrainee,
      traineeModalLoading,
      tableLoading,
      // Validation
      traineeValidation,
      // Computed
      course,
      traineeVisibleColumns,
      // Methods
      openTraineeEditionModal,
      resetTraineeEditionForm,
      updateTrainee,
      validateTraineeDeletion,
    };
  },
};
</script>
