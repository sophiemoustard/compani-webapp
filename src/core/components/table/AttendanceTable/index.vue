<template>
  <div>
    <q-card v-if="displayMetaInfos" class="q-my-md" flat>
      <p class="q-pa-md section-title text-weight-bold ">Données générales</p>
      <div class="row justify-around">
        <div class="column items-center">
          <ni-indicator :indicator="traineesRegistered" />
          <div class="text-center">{{ formatQuantity('apprenant.e inscrit.e', traineesRegistered, 's', false) }}</div>
        </div>
        <div class="column items-center">
          <ni-indicator :indicator="presentTrainees" />
          <div class="text-center">{{ formatQuantity('apprenant.e', presentTrainees, 's', false) }} ont émargé au moins une fois</div>
        </div>
        <div class="column items-center">
          <ni-indicator :indicator="absenceRate" />
          <div class="text-center">de taux d'absence</div>
        </div>
      </div>
    </q-card>
    <q-card flat>
      <q-table v-if="courseHasSlot" :rows="traineesWithAttendance" :columns="attendanceColumns" class="q-pa-md table"
        separator="none" :hide-bottom="!noTrainees" :loading="loading" :pagination="attendancePagination">
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
                  <q-item-label v-if="canAccessTrainee" class="ellipsis clickable-name cursor-pointer">
                    <router-link :to="goToLearnerProfile(props.row)">{{ col.value }}</router-link>
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

    <ni-simple-table :data="formattedAttendanceSheets" :columns="attendanceSheetColumns"
      v-model:pagination="attendanceSheetPagination" :visible-columns="attendanceSheetVisibleColumns"
      :loading="attendanceSheetTableLoading">
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
      :loading="modalLoading" :validation="attendanceValidations.newTraineeAttendance"
      :trainee-filter-options="traineeFilterOptions" v-model:new-trainee-attendance="newTraineeAttendance"
      :trainees="traineesWithAttendance" @submit="addTrainee" />

    <attendance-sheet-addition-modal v-model="attendanceSheetAdditionModal" @hide="resetAttendanceSheetAdditionModal"
        @submit="addAttendanceSheet" v-model:new-attendance-sheet="newAttendanceSheet" :loading="modalLoading"
        :validations="attendanceSheetValidations.newAttendanceSheet" :course="course" />
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { computed, toRefs, ref } from 'vue';
import { useRouter } from 'vue-router';
import pick from 'lodash/pick';
import get from 'lodash/get';
import { DEFAULT_AVATAR, TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN } from '@data/constants';
import { defineAbilitiesFor, defineAbilitiesForCourse } from '@helpers/ability';
import { descendingSortBy } from '@helpers/dates/utils';
import { formatQuantity, formatPercentage } from '@helpers/utils';
import CompaniDate from '@helpers/dates/companiDates';
import { add, multiply, subtract, divide } from '@helpers/numbers';
import Button from '@components/Button';
import SimpleTable from '@components/table/SimpleTable';
import AttendanceSheetAdditionModal from '@components/courses/AttendanceSheetAdditionModal';
import Indicator from '@components/courses/Indicator';
import TraineeAttendanceCreationModal from '../TraineeAttendanceCreationModal';
import { useAttendances } from './Composables/Attendances';
import { useAttendanceSheets } from './Composables/AttendanceSheets';

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
    'ni-indicator': Indicator,
  },
  setup (props) {
    const { course } = toRefs(props);
    const $router = useRouter();
    const $store = useStore();

    const isClientInterface = !/\/ad\//.test($router.currentRoute.value.path);
    const attendancePagination = ref({ rowsPerPage: 0 });
    const attendanceSheetPagination = ref({ page: 1, rowsPerPage: 15 });
    const modalLoading = ref(false);

    const loggedUser = computed(() => $store.state.main.loggedUser);

    const canUpdate = computed(() => {
      const ability = defineAbilitiesFor(pick(loggedUser.value, ['role', 'company', '_id', 'sector']));

      return ability.can('update', 'course_trainee_follow_up');
    });

    const canAccessTrainee = computed(() => {
      const ability = defineAbilitiesForCourse(pick(loggedUser.value, ['role']));

      return ability.can('access', 'trainee');
    });

    const isLastSlotStarted = computed(() => {
      if (course.value.slotsToPlan.length) return false;

      const sortedSlots = [...course.value.slots].sort(descendingSortBy('startDate'));
      return CompaniDate().isSameOrAfter(sortedSlots[0].startDate);
    });

    const vendorRole = computed(() => $store.getters['main/getVendorRole']);

    const isRofOrVendorAdmin = computed(() => [TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN].includes(vendorRole.value));

    const displayMetaInfos = computed(() => !isClientInterface && isRofOrVendorAdmin.value && isLastSlotStarted);

    const traineesRegistered = computed(() => course.value.trainees.length);

    const {
      // Data
      traineeAdditionModal,
      loading,
      newTraineeAttendance,
      attendances,
      // Computed
      attendanceColumns,
      traineesWithAttendance,
      noTrainees,
      courseHasSlot,
      traineeFilterOptions,
      disableCheckbox,
      canAccessLearnerProfile,
      // Methods
      traineesCount,
      getPotentialTrainees,
      attendanceCheckboxValue,
      refreshAttendances,
      updateAttendanceCheckbox,
      slotCheckboxValue,
      addTrainee,
      resetNewTraineeAttendance,
      openTraineeAttendanceAdditionModal,
      updateSlotCheckbox,
      goToLearnerProfile,
      // Validations
      attendanceValidations,
    } = useAttendances(course, isClientInterface, canUpdate, loggedUser, modalLoading);

    const presentTrainees = computed(() => {
      const traineesWithAttendance = course.value.trainees.filter(trainee => attendances.value.some(a => a.trainee === trainee._id));

      return traineesWithAttendance.length;
    });

    const absenceRate = computed(() => {
      const numerator = attendances.value.length;
      const denominator = multiply(course.value.slots.length, traineesRegistered.value);
    
      return formatPercentage(subtract(1, divide(numerator, denominator)));
    });

    const {
      // Data
      attendanceSheetTableLoading,
      attendanceSheetAdditionModal,
      newAttendanceSheet,
      attendanceSheetColumns,
      // Computed
      attendanceSheetVisibleColumns,
      formattedAttendanceSheets,
      // Methods
      disableSheetDeletion,
      refreshAttendanceSheets,
      openAttendanceSheetAdditionModal,
      resetAttendanceSheetAdditionModal,
      addAttendanceSheet,
      validateAttendanceSheetDeletion,
      // Validations
      attendanceSheetValidations,
    } = useAttendanceSheets(course, isClientInterface, canUpdate, loggedUser, modalLoading);

    const getDelimiterClass = (index) => {
      if (index === course.value.trainees.length) return 'unsubscribed-delimiter';
      if (index === course.value.trainees.length - 1) return 'last-subscribed-interline';
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
      attendanceSheetPagination,
      attendancePagination,
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
      canAccessTrainee,
      disableCheckbox,
      isLastSlotStarted,
      displayMetaInfos,
      traineesRegistered,
      presentTrainees,
      absenceRate,
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
      formatQuantity,
      // Validations
      attendanceSheetValidations,
      attendanceValidations,
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
