<template>
  <div>
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
                  <q-item-label @click="canAccessOrEditTrainee(props.row) && goToLearnerProfile(props.row)"
                    :class="['ellipsis', canAccessOrEditTrainee(props.row) && 'clickable-name cursor-pointer']">
                    {{ col.value }}
                  </q-item-label>
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
import { DEFAULT_AVATAR } from '@data/constants';
import { defineAbilitiesFor } from '@helpers/ability';
import Button from '@components/Button';
import SimpleTable from '@components/table/SimpleTable';
import AttendanceSheetAdditionModal from '@components/courses/AttendanceSheetAdditionModal';
import { useLearnersEdition } from '@composables/learnersEdition';
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

    const { canAccessOrEditTrainee } = useLearnersEdition();

    const {
      // Data
      traineeAdditionModal,
      loading,
      newTraineeAttendance,
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
      canAccessOrEditTrainee,
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
