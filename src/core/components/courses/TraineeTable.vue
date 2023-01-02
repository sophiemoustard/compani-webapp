<template>
  <ni-responsive-table :data="trainees" :columns="traineeColumns" v-model:pagination="traineePagination"
    :hide-header="hideHeader" separator="none" :loading="loading" :class="tableClass"
    :visible-columns="traineeVisibleColumns">
    <template #header="{ props }">
      <q-tr :props="props">
        <q-th v-for="col in props.cols" :key="col.name" :props="props" :style="col.style"
          :class="[{ 'table-actions-responsive': col.name === 'actions' }]">
          {{ col.label }}
        </q-th>
      </q-tr>
    </template>
    <template #body="{ props }">
      <q-tr :props="props">
        <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props"
          :style="col.style" :class="[col.classes, { 'border': props.rowIndex === 0 && !hideHeader}]">
          <template v-if="col.name === 'actions' && canEdit">
            <div>
              <ni-button icon="edit" @click="openTraineeEditionModal(props.row)" :disable="!!course.archivedAt" />
              <ni-button icon="close" @click="validateTraineeDeletion(props.row._id)" :disable="!!course.archivedAt" />
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
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
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
import { frPhoneNumber } from '@helpers/vuelidateCustomVal';

export default {
  name: 'TraineeTable',
  props: {
    trainees: { type: Array, default: () => [] },
    canEdit: { type: Boolean, default: false },
    hideHeader: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    tableClass: { type: String, default: () => '' },
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

    const traineePagination = ref({ rowsPerPage: 0, sortBy: 'lastname' });
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
      { name: 'email', label: 'Email', align: 'left', field: row => get(row, 'local.email') || '', classes: 'email' },
      {
        name: 'phone',
        label: 'Téléphone',
        align: 'left',
        field: row => get(row, 'contact.phone') || '',
        format: formatPhone,
      },
      { name: 'actions', label: '', align: 'right', field: '' },
    ]);
    const editedTrainee = ref({ identity: {}, contact: {}, local: {} });

    const traineeRules = {
      editedTrainee: {
        identity: { lastname: { required } },
        contact: { phone: { required, frPhoneNumber } },
      },
    };

    const traineeValidation = useVuelidate(traineeRules, { editedTrainee });

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
      traineeModalLoading,
      editedTrainee,
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
<style lang="sass" scoped>
.email
  @media screen and (min-width: 767px)
    width: 30%
.table-actions-responsive
  width: 15%
.q-table tbody td
  height: 35px
.border
  @media screen and (min-width: 767px)
    border-top: 1px solid $copper-grey-200
</style>
