<template>
<div>
  <q-card flat>
    <q-table v-if="courseHasSlot" :data="trainees" :columns="columns" class="q-pa-md table"
      separator="none" :hide-bottom="!noTrainees" :loading="loading" :pagination="{ rowsPerPage: 0 }">
      <template #header="props">
        <q-tr :props="props">
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            <div v-if="/(slot)/.test(col.name)">
              <div class="text-primary date">{{ col.month }}</div>
              <div class="number">{{ col.day }}</div>
              <div class="text-weight-bold date">{{ col.weekDay }}</div>
              <div class="text-grey">
                <div>{{ col.startHour }}</div>
                <div>{{ col.endHour }}</div>
              </div>
              <div class="text-grey-800">
                <q-icon name="supervisor_account" />
                {{ traineesCount(col.slot) }}
              </div>
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
                  {{ formatIdentity(col.value.identity, 'FL') }}
                  <q-item-section v-if="col.value.external" class="unsubscribed">Pas inscrit</q-item-section>
                </q-item-section>
              </q-item>
            </div>
            <q-checkbox v-else :value="checkboxValue(col.value, col.slot)" dense size="sm"
              @input="updateCheckbox(col.value, col.slot)" :disable="loading || !canUpdateAttendance" />
          </q-td>
        </q-tr>
      </template>
      <template #no-data>
        <div class="text-center text-italic">Aucun apprenant n'a été ajouté à cette formation</div>
      </template>
    </q-table>
    <div v-if="!courseHasSlot" class="text-center text-italic q-pa-lg no-data">
      Aucun créneau n'a été ajouté à cette formation
    </div>
    <ni-button v-if="courseHasSlot && canUpdateAttendance" color="primary" icon="add" class="q-mb-sm"
      label="Ajouter un participant" :disable="loading" @click="traineeAdditionModal = true" />
  </q-card>

  <trainee-attendance-creation-modal v-model="traineeAdditionModal" :course="course" @hide="resetNewTraineeAttendance"
    @submit="addTrainee" :loading="modalLoading" :trainees="trainees" :validation="$v.newTraineeAttendance"
    :new-trainee-attendance.sync="newTraineeAttendance" :trainee-filter-options="traineeFilterOptions" />
</div>
</template>

<script>
import { mapState } from 'vuex';
import pick from 'lodash/pick';
import get from 'lodash/get';
import { required } from 'vuelidate/lib/validators';
import Attendances from '@api/Attendances';
import Users from '@api/Users';
import Button from '@components/Button';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import { DEFAULT_AVATAR, INTRA, INTER_B2B } from '@data/constants';
import { minArrayLength } from '@helpers/vuelidateCustomVal';
import moment from '@helpers/moment';
import { upperCaseFirstLetter, formatIdentity } from '@helpers/utils';
import { defineAbilitiesFor } from '@helpers/ability';
import TraineeAttendanceCreationModal from './TraineeAttendanceCreationModal';

export default {
  name: 'AttendanceTable',
  props: {
    course: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-button': Button,
    'trainee-attendance-creation-modal': TraineeAttendanceCreationModal,
  },
  data () {
    const isClientInterface = !/\/ad\//.test(this.$router.currentRoute.path);

    return {
      formatIdentity,
      DEFAULT_AVATAR,
      attendances: [],
      loading: false,
      modalLoading: false,
      traineeAdditionModal: false,
      newTraineeAttendance: { trainee: '', attendances: [] },
      potentialTrainees: [],
      isClientInterface,
    };
  },
  validations () {
    return {
      newTraineeAttendance: {
        trainee: { required },
        attendances: { minArrayLength: minArrayLength(1) },
      },
    };
  },
  async created () {
    await this.refreshAttendances({ course: this.course._id });
    await this.getTrainees();
  },
  computed: {
    ...mapState('main', ['loggedUser']),
    columns () {
      const columns = [{
        name: 'trainee',
        align: 'left',
        field: row => ({ identity: row.identity, external: !!row.external }),
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
          month: upperCaseFirstLetter(moment(s.startDate).format('MMM')),
          day: moment(s.startDate).date(),
          weekDay: upperCaseFirstLetter(moment(s.startDate).format('ddd')),
          startHour: moment(s.startDate).format('LT'),
          endHour: moment(s.endDate).format('LT'),
        })),
      ];
    },
    noTrainees () {
      return !this.course.trainees.length;
    },
    courseHasSlot () {
      return this.course.slots.length;
    },
    trainees () {
      return [...this.course.trainees, ...this.unsubscribedTrainees];
    },
    unsubscribedTrainees () {
      const traineesId = this.course.trainees.map(trainee => trainee._id);
      const unsubscribedTraineesId = [...new Set(this.attendances
        .filter(a => (!traineesId.includes(get(a, 'trainee._id'))))
        .map(a => get(a, 'trainee._id')))];

      if (!unsubscribedTraineesId.length) return [];

      return unsubscribedTraineesId
        .filter((unsubscribedTraineeId) => {
          const trainee = this.potentialTrainees.find(t => (t._id === unsubscribedTraineeId));

          return !!trainee;
        })
        .map((unsubscribedTraineeId) => {
          const trainee = this.potentialTrainees.find(t => (t._id === unsubscribedTraineeId));
          return { ...trainee, external: true };
        });
    },
    traineeFilterOptions () {
      const formattedTrainees = this.potentialTrainees
        .map(trainee => ({
          label: formatIdentity(trainee.identity, 'FL'),
          value: trainee._id,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      return formattedTrainees.filter(trainee => !this.trainees.map(t => t._id).includes(trainee.value));
    },
    selectedCompany () {
      return this.course.company ? this.course.company._id : '';
    },
    canUpdateAttendance () {
      const ability = defineAbilitiesFor(pick(this.loggedUser, ['role', 'company', '_id', 'sector']));

      return ability.can('update', 'course_trainee_follow_up');
    },
  },
  methods: {
    checkboxValue (traineeId, slotId) {
      if (this.attendances.length) {
        return !!this.attendances.find(a => get(a, 'trainee._id') === traineeId && a.courseSlot === slotId);
      }
      return false;
    },
    traineesCount (slotId) {
      return this.attendances.filter(a => a.courseSlot === slotId).length;
    },
    async refreshAttendances (query) {
      try {
        this.loading = true;
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
    async updateCheckbox (traineeId, slotId) {
      if (!this.canUpdateAttendance) return NotifyNegative('Impossible de modifier l\'emargement.');

      if (this.checkboxValue(traineeId, slotId)) {
        try {
          this.loading = true;
          const attendance = this.attendances.find(a => get(a, 'trainee._id') === traineeId && a.courseSlot === slotId);
          await Attendances.delete(attendance._id);

          await this.refreshAttendances({ courseSlot: slotId });
        } catch (e) {
          console.error(e);
          NotifyNegative('Erreur lors de la suppression de l\'émargement.');
        } finally {
          this.loading = false;
        }
      } else {
        try {
          this.loading = true;
          await Attendances.create({ trainee: traineeId, courseSlot: slotId });

          await this.refreshAttendances({ courseSlot: slotId });
        } catch (e) {
          console.error(e);
          NotifyNegative('Erreur lors de la validation de l\'émargement.');
        } finally {
          this.loading = false;
        }
      }
    },
    async getTrainees () {
      try {
        let query;

        if (this.course.type === INTRA) query = { company: this.selectedCompany };
        if (this.course.type === INTER_B2B) {
          query = !this.isClientInterface ? { hasCompany: true } : { company: get(this.loggedUser, 'company._id') };
        }

        this.potentialTrainees = await Users.learnerList(query);
      } catch (error) {
        this.potentialTrainees = [];
        console.error(error);
      }
    },
    async addTrainee () {
      try {
        if (!this.canUpdateAttendance) return NotifyNegative('Impossible d\'ajouter un participant');

        this.$v.newTraineeAttendance.$touch();
        if (this.$v.newTraineeAttendance.$error) return NotifyWarning('Champs invalides');
        this.modalLoading = true;
        this.newTraineeAttendance.attendances.map(s => this.updateCheckbox(this.newTraineeAttendance.trainee, s));
        this.traineeAdditionModal = false;
        NotifyPositive('Participant ajouté.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'ajout du participant.');
      } finally {
        this.modalLoading = false;
      }
    },
    resetNewTraineeAttendance () {
      this.$v.newTraineeAttendance.$reset();
      this.newTraineeAttendance = { trainee: '', attendances: [] };
    },
  },
};
</script>
<style lang="stylus" scoped>
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
    border-right: 1px solid $grey-200
  tr:first-child
    td:first-child
      .rows
        border-top: 1px solid $grey-200
        padding-top: 8px
        margin-right: 16px
  tr:last-child
    td:first-child
      .rows
        border-bottom: 1px solid $grey-200
        padding-bottom: 8px
        margin-right: 16px

  th:first-child
  td:first-child
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
