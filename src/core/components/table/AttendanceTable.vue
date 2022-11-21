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
              <q-checkbox v-if="canUpdate" :model-value="slotCheckboxValue(col.slot)" dense size="sm"
                @update:model-value="updateSlotCheckbox(col.slot)" :disable="disableCheckbox" />
            </div>
          </q-th>
        </q-tr>
      </template>
      <template #body="props">
        <q-tr :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <div v-if="col.name === 'trainee'" class="rows">
              <q-item>
                <q-item-section avatar>
                  <img class="avatar" :src="props.row.picture ? props.row.picture.link : DEFAULT_AVATAR">
                </q-item-section>
                <q-item-section class="ellipsis">
                  {{ col.value }}
                  <q-item-section v-if="props.row.external" class="unsubscribed">Pas inscrit</q-item-section>
                </q-item-section>
              </q-item>
            </div>
            <q-checkbox v-else :model-value="attendanceCheckboxValue(col.value, col.slot)" dense size="sm"
              @update:model-value="updateAttendanceCheckbox(col.value, col.slot)" :disable="disableCheckbox" />
          </q-td>
        </q-tr>
      </template>
      <template #no-data>
        <div class="text-center text-italic">Aucun(e) participant(e) n'a été ajouté(e) à cette formation</div>
      </template>
    </q-table>
    <div v-if="!courseHasSlot" class="text-center text-italic q-pa-lg no-data">
      Aucun créneau n'a été ajouté à cette formation
    </div>
    <ni-button v-if="courseHasSlot && canUpdate" color="primary" icon="add" class="q-mb-sm"
      label="Ajouter un(e) participant(e)" :disable="loading" @click="openTraineeAttendanceAdditionModal" />
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
import { mapState } from 'vuex';
import pick from 'lodash/pick';
import get from 'lodash/get';
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
} from '@data/constants';
import { minArrayLength } from '@helpers/vuelidateCustomVal';
import CompaniDate from '@helpers/dates/companiDates';
import { upperCaseFirstLetter, formatIdentity, formatAndSortIdentityOptions } from '@helpers/utils';
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
  setup () {
    return { v$: useVuelidate() };
  },
  data () {
    const isClientInterface = !/\/ad\//.test(this.$route.path);

    return {
      formatIdentity,
      DEFAULT_AVATAR,
      attendances: [],
      loading: false,
      modalLoading: false,
      attendanceSheetTableLoading: false,
      traineeAdditionModal: false,
      newTraineeAttendance: { trainee: '', attendances: [] },
      isClientInterface,
      attendanceSheetAdditionModal: false,
      attendanceSheets: [],
      newAttendanceSheet: { course: this.course._id },
      attendanceSheetColumns: [
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
      ],
      pagination: { page: 1, rowsPerPage: 15 },
      potentialTrainees: [],
    };
  },
  validations () {
    return {
      newTraineeAttendance: {
        trainee: { required },
        attendances: { minArrayLength: minArrayLength(1) },
      },
      newAttendanceSheet: {
        file: { required },
        trainee: { required: requiredIf(this.course.type !== INTRA) },
        date: { required: requiredIf(this.course.type === INTRA) },
      },
    };
  },
  async created () {
    await Promise.all([
      this.refreshAttendances({ course: this.course._id }),
      this.refreshAttendanceSheets(),
      this.getPotentialTrainees(),
    ]);
  },
  computed: {
    ...mapState('main', ['loggedUser']),
    attendanceColumns () {
      const columns = [{
        name: 'trainee',
        align: 'left',
        field: row => formatIdentity(row.identity, 'FL'),
        style: !this.$q.platform.is.mobile ? 'max-width: 250px' : 'max-width: 150px',
      }];
      if (!this.course.slots) return columns;

      return [
        ...columns,
        ...this.course.slots.map(s => ({
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
    },
    attendanceSheetVisibleColumns () {
      return this.course.type === INTRA ? ['date', 'actions'] : ['trainee', 'actions'];
    },
    noTrainees () {
      return !this.course.trainees.length;
    },
    courseHasSlot () {
      return this.course.slots.length;
    },
    traineesWithAttendance () {
      return [...this.course.trainees, ...this.unsubscribedTrainees];
    },
    formattedAttendanceSheets () {
      if (this.course.type === INTER_B2B) {
        return this.attendanceSheets.map(as => ({
          ...as,
          trainee: this.traineesWithAttendance.find(trainee => trainee._id === as.trainee._id),
        }));
      }

      return this.attendanceSheets;
    },
    unsubscribedTrainees () {
      const traineesId = this.course.trainees.map(trainee => trainee._id);
      const attendanceInfos = [...this.attendances, ...this.attendanceSheets];

      const unsubscribedTraineesId = [...new Set(attendanceInfos
        .filter(a => (!traineesId.includes(get(a, 'trainee._id'))))
        .map(a => get(a, 'trainee._id')))];

      if (!unsubscribedTraineesId.length) return [];

      return unsubscribedTraineesId.reduce((acc, traineeId) => {
        const trainee = this.potentialTrainees.find(t => (t._id === traineeId));
        if (trainee) acc.push({ ...trainee, external: true });

        return acc;
      }, []);
    },
    traineeFilterOptions () {
      const formattedTrainees = formatAndSortIdentityOptions(this.potentialTrainees);

      return formattedTrainees.filter(trainee => !this.traineesWithAttendance.map(t => t._id).includes(trainee.value));
    },
    canUpdate () {
      const ability = defineAbilitiesFor(pick(this.loggedUser, ['role', 'company', '_id', 'sector']));

      return ability.can('update', 'course_trainee_follow_up');
    },
    disableCheckbox () {
      return this.loading || !this.canUpdate || !!this.course.archivedAt;
    },
  },
  methods: {
    get,
    attendanceCheckboxValue (traineeId, slotId) {
      if (this.attendances.length) {
        return !!this.attendances.find(a => get(a, 'trainee._id') === traineeId && a.courseSlot === slotId);
      }
      return false;
    },
    disableSheetDeletion (attendanceSheet) {
      return !attendanceSheet.file.link || !!this.course.archivedAt;
    },
    traineesCount (slotId) {
      return this.attendances.filter(a => a.courseSlot === slotId).length;
    },
    async getPotentialTrainees () {
      try {
        let query;

        if (this.isClientInterface) query = { companies: [get(this.loggedUser.value, 'company._id')] };
        else query = { companies: this.course.companies.map(c => c._id) };

        this.potentialTrainees = query.companies.length ? Object.freeze(await Users.learnerList(query)) : [];
      } catch (error) {
        this.potentialTrainees = [];
        console.error(error);
      }
    },
    async refreshAttendanceSheets () {
      try {
        this.attendanceSheetTableLoading = true;
        const attendanceSheets = await AttendanceSheets.list({ course: this.course._id });

        if (this.course.type === INTER_B2B && this.isClientInterface) {
          this.attendanceSheets = attendanceSheets
            .filter(a => get(a, 'trainee.company') === this.loggedUser.company._id);
        } else this.attendanceSheets = attendanceSheets;
      } catch (e) {
        console.error(e);
        this.attendanceSheets = [];
        NotifyNegative('Erreur lors de la récupération des feuilles d\'émargement.');
      } finally {
        this.attendanceSheetTableLoading = false;
      }
    },
    openAttendanceSheetAdditionModal () {
      if (this.course.archivedAt) {
        return NotifyWarning('Vous ne pouvez pas ajouter de feuilles d\'émargement à une formation archivée.');
      }

      this.attendanceSheetAdditionModal = true;
    },
    resetAttendanceSheetAdditionModal () {
      this.v$.newAttendanceSheet.$reset();
      this.newAttendanceSheet = { course: this.course._id };
    },
    formatPayload () {
      const { course, file, trainee, date } = this.newAttendanceSheet;
      const form = new FormData();
      this.course.type === INTRA ? form.append('date', date) : form.append('trainee', trainee);
      form.append('course', course);
      form.append('file', file);

      return form;
    },
    async addAttendanceSheet () {
      try {
        if (!this.canUpdate) return NotifyNegative('Impossible d\'ajouter une feuille d\'émargement.');

        this.v$.newAttendanceSheet.$touch();
        if (this.v$.newAttendanceSheet.$error) return NotifyWarning('Champ(s) invalide(s)');
        this.modalLoading = true;

        await AttendanceSheets.create(this.formatPayload());

        this.attendanceSheetAdditionModal = false;
        NotifyPositive('Feuille d\'émargement ajoutée.');
        await this.refreshAttendanceSheets();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'ajout de la feuille d\'émargement.');
      } finally {
        this.modalLoading = false;
      }
    },
    validateAttendanceSheetDeletion (attendanceSheet) {
      if (!this.canUpdate) return NotifyNegative('Impossible de supprimer la feuille d\'émargement.');

      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer cette feuille d\'émargement&nbsp;?',
        html: true,
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteAttendanceSheet(attendanceSheet._id))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async deleteAttendanceSheet (attendanceSheetId) {
      try {
        this.$q.loading.show();
        await AttendanceSheets.delete(attendanceSheetId);

        NotifyPositive('Feuille d\'émargement supprimée.');
        await this.refreshAttendanceSheets();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppresion de la feuille d\'émargement.');
      } finally {
        this.$q.loading.hide();
      }
    },
    async refreshAttendances (query) {
      try {
        this.loading = true;
        if (!this.courseHasSlot) return;

        const updatedCourseSlot = await Attendances.list(query);

        this.attendances = query.courseSlot
          ? [...this.attendances.filter(a => a.courseSlot !== query.courseSlot), ...updatedCourseSlot]
          : updatedCourseSlot;
        NotifyPositive('Liste mise à jour.');
      } catch (e) {
        console.error(e);
        this.attendances = [];
        NotifyNegative('Erreur lors de la mise à jour des émargements.');
      } finally {
        this.loading = false;
      }
    },
    async updateAttendanceCheckbox (traineeId, slotId) {
      try {
        if (!this.canUpdate) return NotifyNegative('Impossible de modifier l\'émargement.');

        this.loading = true;
        if (this.attendanceCheckboxValue(traineeId, slotId)) {
          await Attendances.delete({ trainee: traineeId, courseSlot: slotId });
        } else {
          await Attendances.create({ trainee: traineeId, courseSlot: slotId });
        }

        await this.refreshAttendances({ courseSlot: slotId });
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification de l\'émargement.');
      } finally {
        this.loading = false;
      }
    },
    async addTrainee () {
      try {
        if (!this.canUpdate) return NotifyNegative('Impossible d\'ajouter un(e) participant(e).');

        this.v$.newTraineeAttendance.$touch();
        if (this.v$.newTraineeAttendance.$error) return NotifyWarning('Champs invalides');
        this.modalLoading = true;
        this.newTraineeAttendance.attendances
          .map(s => this.updateAttendanceCheckbox(this.newTraineeAttendance.trainee, s));
        this.traineeAdditionModal = false;
        NotifyPositive('Participant(e) ajouté(e).');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'ajout du/de la participant(e).');
      } finally {
        this.modalLoading = false;
      }
    },
    resetNewTraineeAttendance () {
      this.v$.newTraineeAttendance.$reset();
      this.newTraineeAttendance = { trainee: '', attendances: [] };
    },
    openTraineeAttendanceAdditionModal () {
      if (this.course.archivedAt) {
        return NotifyWarning('Vous ne pouvez pas ajouter un(e) participant(e) à une formation archivée.');
      }

      this.traineeAdditionModal = true;
    },
    slotCheckboxValue (slotId) {
      const attendancesForRegisteredLearners = this.attendances.filter(a => a.courseSlot === slotId &&
        this.course.trainees.some(t => t._id === a.trainee._id));

      return attendancesForRegisteredLearners.length === this.course.trainees.length;
    },
    async updateSlotCheckbox (slotId) {
      try {
        this.loading = true;
        if (!this.canUpdate) return NotifyNegative('Impossible d\'ajouter un(e) participant(e).');

        if (this.slotCheckboxValue(slotId)) await Attendances.delete({ courseSlot: slotId });
        else await Attendances.create({ courseSlot: slotId });

        await this.refreshAttendances({ courseSlot: slotId });
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification de l\'émargement.');
      } finally {
        this.loading = false;
      }
    },
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
  align-self: center

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
</style>
