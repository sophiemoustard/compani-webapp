<template>
  <ni-responsive-table :data="displayedTrainees" :columns="traineeColumns" v-model:pagination="traineePagination"
    separator="none" :loading="loading" :class="tableClass" :visible-columns="traineeVisibleColumns">
    <template #header="{ props }">
      <q-tr :props="props">
        <q-th v-for="col in props.cols" :key="col.name" :props="props" :style="col.style"
          :class="[{ 'table-actions-responsive': col.name === 'actions' }]" auto-width>
          {{ col.label }}
        </q-th>
      </q-tr>
    </template>
    <template #body="{ props }">
      <q-tr :props="props" :class="{'border': props.row.isCompany }">
        <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :style="col.style"
          :class="[col.classes, { 'border': props.row.isCompany }]">
          <template v-if="col.name === 'traineeName' && props.row.isCompany">
            <div v-if="canEdit" @click="goToCompany(col.value)" class="clickable-name"> {{ col.value }}</div>
            <div v-else>{{ col.value }}</div>
          </template>
          <template v-else-if="col.name === 'connectionInfos'">
            <a v-if="col.value">{{ col.value }}</a>
            <connected-dot v-else-if="!props.row.isCompany" />
          </template>
          <template v-else-if="col.name === 'actions' && canEdit">
            <div v-if="!props.row.isCompany">
              <ni-button icon="edit" @click="openTraineeEditionModal(props.row)"
                :disable="!canEditTrainee(props.row) || !!course.archivedAt" />
              <ni-button icon="close" @click="validateTraineeDeletion(props.row._id)" :disable="!!course.archivedAt" />
            </div>
            <div v-else>
              <ni-button v-if="canEdit" icon="close" :disable="!!course.archivedAt" />
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
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import { formatPhone, formatPhoneForPayload, formatIdentity } from '@helpers/utils';
import Courses from '@api/Courses';
import Users from '@api/Users';
import Button from '@components/Button';
import TraineeEditionModal from '@components/courses/TraineeEditionModal';
import ResponsiveTable from '@components/table/ResponsiveTable';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { frPhoneNumber } from '@helpers/vuelidateCustomVal';
import { useLearnersEdition } from '@composables/learnersEdition';
import ConnectedDot from './ConnectedDot';
import { INTRA } from '../../data/constants';

export default {
  name: 'TraineeTable',
  props: {
    trainees: { type: Array, default: () => [] },
    canEdit: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    tableClass: { type: String, default: () => '' },
  },
  components: {
    'ni-button': Button,
    'ni-responsive-table': ResponsiveTable,
    'trainee-edition-modal': TraineeEditionModal,
    'connected-dot': ConnectedDot,
  },
  emits: ['refresh'],
  setup (props, { emit }) {
    const { canEdit, trainees } = toRefs(props);

    const $q = useQuasar();
    const $store = useStore();
    const $router = useRouter();

    const { canEditTrainee } = useLearnersEdition();

    const isVendorInterface = /\/ad\//.test($router.currentRoute.value.path);
    const traineePagination = ref({ rowsPerPage: 0 });
    const traineeEditionModal = ref(false);
    const traineeModalLoading = ref(false);
    const traineeColumns = ref([
      {
        name: 'traineeName',
        label: 'Prénom et Nom',
        align: 'left',
        field: row => formatIdentity(get(row, 'identity'), 'FL'),
        style: 'width: 200px',
      },
      {
        name: 'email',
        label: 'Email',
        align: 'left',
        field: row => get(row, 'local.email') || '',
        classes: 'email',
        style: 'width: 200px',
      },
      {
        name: 'phone',
        label: 'Téléphone',
        align: 'center',
        field: row => get(row, 'contact.phone') || '',
        format: formatPhone,
        style: 'width: 112px',
      },
      {
        name: 'connectionInfos',
        label: 'Code de connexion à l\'app',
        field: 'loginCode',
        align: 'center',
        style: 'width: 112px',
      },
      { name: 'actions', label: '', align: 'right', field: '', style: 'width: 96px' },
    ]);

    const editedTrainee = ref({ identity: {}, contact: {}, local: {} });

    const goToCompany = async (companyName) => {
      const companyId = course.value.companies.find(c => c.name === companyName)._id;
      $router.push({ name: 'ni users companies info', params: { companyId }, query: { defaultTab: 'infos' } });
    };

    const displayedTrainees = computed(() => {
      if (!course.value) return [];
      if (course.value.type === INTRA) return trainees.value;
      if (!isVendorInterface) return trainees.value;

      const traineesGroupedByCompanies = groupBy(trainees.value, t => t.registrationCompany);
      const companiesWithTrainees = Object.keys(traineesGroupedByCompanies);

      const result = [];
      for (const companyId of companiesWithTrainees) {
        const company = course.value.companies.find(c => c._id === companyId);
        result.push({ identity: { firstname: company.name }, isCompany: true, isEmpty: false });
        result.push(...traineesGroupedByCompanies[companyId]);
      }

      for (const company of course.value.companies) {
        if (companiesWithTrainees.includes(company._id)) continue;
        result.push({ identity: { firstname: company.name }, isCompany: true, isEmpty: true });
      }

      return result;
    });

    const traineeRules = {
      editedTrainee: {
        identity: { lastname: { required } },
        contact: { phone: { required, frPhoneNumber } },
      },
    };

    const traineeValidation = useVuelidate(traineeRules, { editedTrainee });

    const course = computed(() => $store.state.course.course);

    const traineeVisibleColumns = computed(() => {
      const col = ['traineeName', 'email', 'phone', 'connectionInfos', 'isCertified'];

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
      displayedTrainees,
      traineeVisibleColumns,
      // Methods
      goToCompany,
      openTraineeEditionModal,
      resetTraineeEditionForm,
      updateTrainee,
      validateTraineeDeletion,
      canEditTrainee,
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
