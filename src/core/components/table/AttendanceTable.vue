<template>
<div>
  <q-card flat>
    <q-table v-if="courseHasSlot" :rows="traineesWithAttendance" :columns="attendanceColumns" class="q-pa-md table"
      separator="none" :hide-bottom="!noTrainees" :loading="loading" :pagination="{ rowsPerPage: 0 }">
      <template #header="props">
        <q-tr :props="props">
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            <div v-if="/(slot)/.test(col.name)">
              <div class="text-primary date">{{ col.month }}</div>
              <div class="number">{{ col.day }}</div>
              <div class="text-weight-bold date">{{ col.weekDay }}</div>
              <div class="text-copper-grey-400">
                <div>{{ col.startHour }}</div>
                <div>{{ col.endHour }}</div>
              </div>
              <div class="text-copper-grey-800">
                <q-icon name="supervisor_account" />
                {{ traineesCount(col.slot) }}
              </div>
              <q-checkbox v-if="canUpdate && course.trainees.length" :model-value="slotCheckboxValue(col.slot)"
                dense size="sm" @update:model-value="updateSlotCheckbox(col.slot)" :disable="disableCheckbox" />
            </div>
          </q-th>
        </q-tr>
      </template>
      <template #body="props">
        <q-tr :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :props="props" :class="getDelimiterClass(props.rowIndex)">
            <q-item v-if="col.name === 'trainee'" class="rows">
              <q-item-section avatar>
                <img class="avatar" :src="props.row.picture ? props.row.picture.link : DEFAULT_AVATAR">
              </q-item-section>
              <q-item-section>
                <q-item-label v-if="canAccessLearnerProfile" class="ellipsis clickable-name cursor-pointer"
                  @click="goToLearnerProfile(props.row)">
                  {{ col.value }}
                </q-item-label>
                <q-item-label v-else class="ellipsis">{{ col.value }}</q-item-label>
                <q-item-label v-if="props.row.external" class="unsubscribed">Pas inscrit</q-item-label>
              </q-item-section>
            </q-item>
            <q-checkbox v-else :model-value="attendanceCheckboxValue(col.value, col.slot)" dense size="sm"
              @update:model-value="updateAttendanceCheckbox(col.value, col.slot)" :disable="disableCheckbox" />
          </q-td>
        </q-tr>
      </template>
      <template #no-data>
        <div class="text-center text-italic">Aucun(e) stagiaire n'a été ajouté(e) à cette formation</div>
      </template>
    </q-table>
    <div v-if="!courseHasSlot" class="text-center text-italic q-pa-lg no-data">
      Aucun créneau n'a été ajouté à cette formation
    </div>
    <ni-button v-if="courseHasSlot && canUpdate" color="primary" icon="add" class="q-mb-sm" :disable="loading"
      label="Ajouter un(e) participant(e) non inscrit(e)" @click="openTraineeAttendanceAdditionModal" />
  </q-card>

  <ni-simple-table :data="formattedAttendanceSheets" :columns="attendanceSheetColumns" v-model:pagination="pagination"
    :visible-columns="attendanceSheetVisibleColumns" :loading="attendanceSheetTableLoading">
    <template #body="{ props }">
      <q-tr :props="props">
        <q-td :props="props" v-for="col in props.cols" :key="col.name" :data-label="col.label" :class="col.name"
          :style="col.style">
          <template v-if="col.name === 'actions'">
            <div class="row no-wrap table-actions justify-end">
              <ni-button icon="file_download" color="primary" type="a" :href="props.row.file.link"
                :disable="!props.row.file.link" />
              <ni-button v-if="canUpdate" icon="delete" color="primary"
                @click="validateAttendanceSheetDeletion(props.row)" :disable="disableSheetDeletion(props.row)" />
            </div>
          </template>
          <template v-else>
            {{ col.value }}
            <div v-if="get(props.row, 'trainee.external')" class="unsubscribed text-primary">Pas inscrit</div>
          </template>
        </q-td>
      </q-tr>
    </template>
  </ni-simple-table>
  <div class="flex justify-end">
    <ni-button v-if="canUpdate" class="bg-primary" color="white" icon="add"
      label="Ajouter une feuille d'émargement" @click="openAttendanceSheetAdditionModal" />
  </div>

  <trainee-attendance-creation-modal v-model="traineeAdditionModal" :course="course" @hide="resetNewTraineeAttendance"
    :loading="modalLoading" :validation="v$.newTraineeAttendance" :trainee-filter-options="traineeFilterOptions"
    v-model:new-trainee-attendance="newTraineeAttendance" :trainees="traineesWithAttendance" @submit="addTrainee" />

  <attendance-sheet-addition-modal v-model="attendanceSheetAdditionModal" @hide="resetAttendanceSheetAdditionModal"
      @submit="addAttendanceSheet" v-model:new-attendance-sheet="newAttendanceSheet" :loading="modalLoading"
      :validations="v$.newAttendanceSheet" :course="course" />
</div>
</template>

<script>
import { useStore } from 'vuex';
import { computed, toRefs, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import pick from 'lodash/pick';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import useVuelidate from '@vuelidate/core';
import { required, requiredIf } from '@vuelidate/validators';
import Attendances from '@api/Attendances';
import AttendanceSheets from '@api/AttendanceSheets';
import Users from '@api/Users';
import Button from '@components/Button';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import {
  DEFAULT_AVATAR,
  INTRA,
  INTER_B2B,
  HH_MM,
  DAY_OF_WEEK_SHORT,
  DAY_OF_MONTH,
  MONTH_SHORT,
  DD_MM_YYYY,
  COACH_ROLES,
  VENDOR_ADMIN,
  TRAINING_ORGANISATION_MANAGER,
} from '@data/constants';
import { minArrayLength } from '@helpers/vuelidateCustomVal';
import CompaniDate from '@helpers/dates/companiDates';
import { upperCaseFirstLetter, formatIdentity, formatAndSortIdentityOptions, sortStrings } from '@helpers/utils';
import { defineAbilitiesFor } from '@helpers/ability';
import SimpleTable from '@components/table/SimpleTable';
import AttendanceSheetAdditionModal from '@components/courses/AttendanceSheetAdditionModal';
import TraineeAttendanceCreationModal from './TraineeAttendanceCreationModal';

export default {
  name: 'AttendanceTable',
  props: {
    course: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-button': Button,
    'ni-simple-table': SimpleTable,
    'trainee-attendance-creation-modal': TraineeAttendanceCreationModal,
    'attendance-sheet-addition-modal': AttendanceSheetAdditionModal,
  },
  setup (props) {
    const { course } = toRefs(props);

    const $store = useStore();
    const $q = useQuasar();
    const $router = useRouter();

    const attendances = ref([]);
    const loading = ref(false);
    const modalLoading = ref(false);
    const attendanceSheetTableLoading = ref(false);
    const traineeAdditionModal = ref(false);
    const newTraineeAttendance = ref({ trainee: '', attendances: [] });
    const attendanceSheetAdditionModal = ref(false);
    const attendanceSheets = ref([]);
    const newAttendanceSheet = ref({ course: course.value._id });
    const attendanceSheetColumns = ref([
      {
        name: 'date',
        label: 'Date',
        align: 'left',
        field: 'date',
        format: value => CompaniDate(value).format(DD_MM_YYYY),
      },
      {
        name: 'trainee',
        label: 'Participant(e)',
        align: 'left',
        field: row => formatIdentity(get(row, 'trainee.identity'), 'FL'),
      },
      { name: 'actions', label: '', align: 'left' },
    ]);
    const pagination = ref({ page: 1, rowsPerPage: 15 });
    const potentialTrainees = ref([]);

    const isClientInterface = !/\/ad\//.test($router.currentRoute.value.path);

    const rules = computed(() => ({
      newTraineeAttendance: { trainee: { required }, attendances: { minArrayLength: minArrayLength(1) } },
      newAttendanceSheet: {
        file: { required },
        trainee: { required: requiredIf(course.value.type !== INTRA) },
        date: { required: requiredIf(course.value.type === INTRA) },
      },
    }));

    const v$ = useVuelidate(rules, { newTraineeAttendance, newAttendanceSheet });

    const loggedUser = computed(() => $store.state.main.loggedUser);

    const clientRole = computed(() => $store.getters['main/getClientRole']);

    const vendorRole = computed(() => $store.getters['main/getVendorRole']);

    const canAccessLearnerProfile = computed(() => COACH_ROLES.includes(clientRole.value) ||
      [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER].includes(vendorRole.value));

    const attendanceColumns = computed(() => {
      const columns = [{
        name: 'trainee',
        align: 'left',
        field: row => formatIdentity(row.identity, 'FL'),
        style: !$q.platform.is.mobile ? 'max-width: 250px' : 'max-width: 150px',
      }];
      if (!course.value.slots) return columns;

      return [
        ...columns,
        ...course.value.slots.map(s => ({
          name: `slot-${s._id}`,
          slot: s._id,
          field: '_id',
          align: 'center',
          style: 'width: 80px; min-width: 80px',
          month: upperCaseFirstLetter(CompaniDate(s.startDate).format(MONTH_SHORT)),
          day: CompaniDate(s.startDate).format(DAY_OF_MONTH),
          weekDay: upperCaseFirstLetter(CompaniDate(s.startDate).format(DAY_OF_WEEK_SHORT)),
          startHour: CompaniDate(s.startDate).format(HH_MM),
          endHour: CompaniDate(s.endDate).format(HH_MM),
        })),
      ];
    });

    const attendanceSheetVisibleColumns = computed(() => (course.value.type === INTRA
      ? ['date', 'actions']
      : ['trainee', 'actions']));

    const noTrainees = computed(() => !course.value.trainees.length);

    const courseHasSlot = computed(() => course.value.slots.length);

    const formattedAttendanceSheets = computed(() => {
      if (course.value.type === INTER_B2B) {
        return attendanceSheets.value.map(as => ({
          ...as,
          trainee: traineesWithAttendance.value.find(trainee => trainee._id === as.trainee._id),
        }));
      }

      return attendanceSheets.value;
    });

    const unsubscribedTrainees = computed(() => {
      const traineesId = course.value.trainees.map(trainee => trainee._id);
      const attendanceInfos = [...attendances.value, ...attendanceSheets.value];

      const unsubscribedTraineesId = [...new Set(attendanceInfos
        .filter(a => (!traineesId.includes(a.trainee)))
        .map(a => a.trainee))];

      if (!unsubscribedTraineesId.length) return [];

      return unsubscribedTraineesId
        .reduce((acc, traineeId) => {
          const trainee = potentialTrainees.value.find(t => (t._id === traineeId));
          if (trainee) acc.push({ ...trainee, external: true });

          return acc;
        }, [])
        .sort((a, b) => sortStrings(a.identity.lastname, b.identity.lastname));
    });

    const traineesWithAttendance = computed(() => ([...course.value.trainees, ...unsubscribedTrainees.value]));

    const traineeFilterOptions = computed(() => {
      const formattedTrainees = formatAndSortIdentityOptions(potentialTrainees.value);

      return formattedTrainees.filter(trainee => !traineesWithAttendance.value.map(t => t._id).includes(trainee.value));
    });

    const canUpdate = computed(() => {
      const ability = defineAbilitiesFor(pick(loggedUser.value, ['role', 'company', '_id', 'sector']));

      return ability.can('update', 'course_trainee_follow_up');
    });

    const disableCheckbox = computed(() => loading.value || !canUpdate.value || !!course.value.archivedAt);

    const attendanceCheckboxValue = (traineeId, slotId) => {
      if (attendances.value.length) {
        return !!attendances.value.find(a => a.trainee === traineeId && a.courseSlot === slotId);
      }
      return false;
    };

    const disableSheetDeletion = attendanceSheet => !attendanceSheet.file.link || !!course.value.archivedAt;

    const traineesCount = slotId => attendances.value.filter(a => a.courseSlot === slotId).length;

    const getPotentialTrainees = async () => {
      try {
        let query;

        if (isClientInterface) query = { companies: get(loggedUser.value, 'company._id') };
        else query = { companies: course.value.companies.map(c => c._id) };

        potentialTrainees.value = !isEmpty(query.companies) ? Object.freeze(await Users.learnerList(query)) : [];
      } catch (error) {
        potentialTrainees.value = [];
        console.error(error);
      }
    };

    const refreshAttendanceSheets = async () => {
      try {
        attendanceSheetTableLoading.value = true;
        const attendanceSheetList = await AttendanceSheets.list({ course: course.value._id });

        if (course.value.type === INTER_B2B && isClientInterface) {
          attendanceSheets.value = attendanceSheetList.filter(a => a.company === loggedUser.value.company._id);
        } else attendanceSheets.value = attendanceSheetList;
      } catch (e) {
        console.error(e);
        attendanceSheets.value = [];
        NotifyNegative('Erreur lors de la récupération des feuilles d\'émargement.');
      } finally {
        attendanceSheetTableLoading.value = false;
      }
    };

    const openAttendanceSheetAdditionModal = () => {
      if (course.value.archivedAt) {
        return NotifyWarning('Vous ne pouvez pas ajouter de feuilles d\'émargement à une formation archivée.');
      }

      attendanceSheetAdditionModal.value = true;
    };

    const resetAttendanceSheetAdditionModal = () => {
      v$.value.newAttendanceSheet.$reset();
      newAttendanceSheet.value = { course: course.value._id };
    };

    const formatPayload = () => {
      const { course: newAttendanceSheetCourse, file, trainee, date } = newAttendanceSheet.value;
      const form = new FormData();
      course.value.type === INTRA ? form.append('date', date) : form.append('trainee', trainee);
      form.append('course', newAttendanceSheetCourse);
      form.append('file', file);

      return form;
    };

    const addAttendanceSheet = async () => {
      try {
        if (!canUpdate.value) return NotifyNegative('Impossible d\'ajouter une feuille d\'émargement.');

        v$.value.newAttendanceSheet.$touch();
        if (v$.value.newAttendanceSheet.$error) return NotifyWarning('Champ(s) invalide(s)');
        modalLoading.value = true;

        await AttendanceSheets.create(formatPayload());

        attendanceSheetAdditionModal.value = false;
        NotifyPositive('Feuille d\'émargement ajoutée.');
        await refreshAttendanceSheets();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'ajout de la feuille d\'émargement.');
      } finally {
        modalLoading.value = false;
      }
    };

    const validateAttendanceSheetDeletion = (attendanceSheet) => {
      if (!canUpdate.value) return NotifyNegative('Impossible de supprimer la feuille d\'émargement.');

      $q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer cette feuille d\'émargement&nbsp;?',
        html: true,
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => deleteAttendanceSheet(attendanceSheet._id))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    };

    const deleteAttendanceSheet = async (attendanceSheetId) => {
      try {
        $q.loading.show();
        await AttendanceSheets.delete(attendanceSheetId);

        NotifyPositive('Feuille d\'émargement supprimée.');
        await refreshAttendanceSheets();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppresion de la feuille d\'émargement.');
      } finally {
        $q.loading.hide();
      }
    };

    const refreshAttendances = async (query) => {
      try {
        loading.value = true;
        if (!courseHasSlot.value) return;

        const updatedCourseSlot = await Attendances.list(query);

        attendances.value = query.courseSlot
          ? [...attendances.value.filter(a => a.courseSlot !== query.courseSlot), ...updatedCourseSlot]
          : updatedCourseSlot;
        NotifyPositive('Liste mise à jour.');
      } catch (e) {
        console.error(e);
        attendances.value = [];
        NotifyNegative('Erreur lors de la mise à jour des émargements.');
      } finally {
        loading.value = false;
      }
    };

    const updateAttendanceCheckbox = async (traineeId, slotId) => {
      try {
        if (!canUpdate.value) {
          NotifyNegative('Impossible de modifier l\'émargement.');
          return false;
        }

        loading.value = true;
        if (attendanceCheckboxValue(traineeId, slotId)) {
          await Attendances.delete({ trainee: traineeId, courseSlot: slotId });
        } else {
          await Attendances.create({ trainee: traineeId, courseSlot: slotId });
        }

        await refreshAttendances({ courseSlot: slotId });
        return true;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification de l\'émargement.');
        return false;
      } finally {
        loading.value = false;
      }
    };

    const addTrainee = async () => {
      try {
        if (!canUpdate.value) return NotifyNegative('Impossible d\'ajouter un(e) participant(e).');

        v$.value.newTraineeAttendance.$touch();
        if (v$.value.newTraineeAttendance.$error) return NotifyWarning('Champs invalides');
        modalLoading.value = true;
        const promises = await Promise.all(newTraineeAttendance.value.attendances
          .map(s => updateAttendanceCheckbox(newTraineeAttendance.value.trainee, s)));
        traineeAdditionModal.value = false;
        if (promises.some(p => !!p))NotifyPositive('Participant(e) ajouté(e).');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'ajout du/de la participant(e).');
      } finally {
        modalLoading.value = false;
      }
    };

    const resetNewTraineeAttendance = () => {
      v$.value.newTraineeAttendance.$reset();
      newTraineeAttendance.value = { trainee: '', attendances: [] };
    };

    const openTraineeAttendanceAdditionModal = () => {
      if (course.value.archivedAt) {
        return NotifyWarning('Vous ne pouvez pas ajouter un(e) participant(e) à une formation archivée.');
      }

      traineeAdditionModal.value = true;
    };

    const slotCheckboxValue = (slotId) => {
      const attendancesForRegisteredLearners = attendances.value.filter(a => a.courseSlot === slotId &&
        course.value.trainees.some(t => t._id === a.trainee));

      return attendancesForRegisteredLearners.length === course.value.trainees.length;
    };

    const updateSlotCheckbox = async (slotId) => {
      try {
        loading.value = true;
        if (!canUpdate.value) return NotifyNegative('Impossible d\'ajouter un(e) participant(e).');

        if (slotCheckboxValue(slotId)) await Attendances.delete({ courseSlot: slotId });
        else await Attendances.create({ courseSlot: slotId });

        await refreshAttendances({ courseSlot: slotId });
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification de l\'émargement.');
      } finally {
        loading.value = false;
      }
    };

    const getDelimiterClass = (index) => {
      if (index === course.value.trainees.length) return 'unsubscribed-delimiter';
      if (index === course.value.trainees.length - 1) return 'last-subscribed-interline';
    };

    const goToLearnerProfile = (row) => {
      const name = isClientInterface ? 'ni courses learners info' : 'ni users learners info';
      $router.push({ name, params: { learnerId: row._id } });
    };

    const created = async () => {
      await Promise.all([
        refreshAttendances({ course: course.value._id }),
        refreshAttendanceSheets(),
        getPotentialTrainees(),
      ]);
    };

    created();

    return {
      // Data
      DEFAULT_AVATAR,
      loading,
      modalLoading,
      attendanceSheetTableLoading,
      traineeAdditionModal,
      newTraineeAttendance,
      attendanceSheetAdditionModal,
      newAttendanceSheet,
      attendanceSheetColumns,
      pagination,
      // Computed
      canAccessLearnerProfile,
      attendanceColumns,
      attendanceSheetVisibleColumns,
      noTrainees,
      courseHasSlot,
      traineesWithAttendance,
      formattedAttendanceSheets,
      traineeFilterOptions,
      canUpdate,
      disableCheckbox,
      // Methods
      get,
      attendanceCheckboxValue,
      disableSheetDeletion,
      traineesCount,
      openAttendanceSheetAdditionModal,
      resetAttendanceSheetAdditionModal,
      addAttendanceSheet,
      validateAttendanceSheetDeletion,
      updateAttendanceCheckbox,
      addTrainee,
      resetNewTraineeAttendance,
      openTraineeAttendanceAdditionModal,
      slotCheckboxValue,
      updateSlotCheckbox,
      getDelimiterClass,
      goToLearnerProfile,
      // Validations
      v$,
    };
  },
};
</script>

<style lang="sass" scoped>
.number
  font-size: 24px
.date
  font-size: 16px
.no-data
  font-size: 12px

.ellipsis
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
  display: block

.table
  thead tr:first-child th:first-child
    background-color: white
  td:first-child
    background-color: white
  th
    border-right: 1px solid $copper-grey-200
  tr:first-child
    td:first-child
      .rows
        border-top: 1px solid $copper-grey-200
        padding-top: 8px
        margin-right: 16px
  tr:last-child
    td:first-child
      .rows
        border-bottom: 1px solid $copper-grey-200
        padding-bottom: 8px
        margin-right: 16px
  td:first-child, th:first-child
    position: sticky
    left: 0
    z-index: 1

.unsubscribed
  color: $secondary
  line-height: 1
  font-size: 11px
  font-style: italic
  padding-top: 3px

.unsubscribed-delimiter
  border-top: 1px solid $copper-grey-200
  padding-top: 16px

.last-subscribed-interline
  padding-bottom: 16px
</style>
