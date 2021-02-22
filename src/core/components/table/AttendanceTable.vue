<template>
<div>
  <q-card flat>
    <q-table v-if="!noSlots" :data="learners" :columns="columns" class="q-pa-md table"
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
              @input="updateCheckbox(col.value, col.slot)" :disable="loading" />
          </q-td>
        </q-tr>
      </template>
      <template #no-data>
        <div class="text-center text-italic">Aucun apprenant n'a été ajouté à cette formation</div>
      </template>
    </q-table>
    <ni-button color="primary" icon="add" label="Ajouter un participant" :disable="loading"
      @click="traineeAdditionModal = true" class="q-mb-sm" />
    <div v-if="noSlots" class="text-center text-italic q-pa-lg no-data">
      Aucun créneau n'a été ajouté à cette formation
    </div>
  </q-card>

  <learner-attendance-creation-modal v-model="traineeAdditionModal" :course="course" @hide="resetSelectedTrainee"
    @submit="addLearner" :loading="modalLoading" :learners="learners" :selected-trainee.sync="selectedTrainee"
    :trainee-filter-options="traineeFilterOptions" />
</div>
</template>

<script>
import uniqBy from 'lodash/uniqBy';
import moment from '@helpers/moment';
import { upperCaseFirstLetter, formatIdentity } from '@helpers/utils';
import { DEFAULT_AVATAR, INTRA } from '@data/constants';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import Button from '@components/Button';
import Attendances from '@api/Attendances';
import Users from '@api/Users';
import LearnerAttendanceCreationModal from './LearnerAttendanceCreationModal';

export default {
  name: 'AttendanceTable',
  props: {
    course: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-button': Button,
    'learner-attendance-creation-modal': LearnerAttendanceCreationModal,
  },
  data () {
    return {
      formatIdentity,
      DEFAULT_AVATAR,
      attendances: [],
      loading: false,
      modalLoading: false,
      traineeAdditionModal: false,
      selectedTrainee: {},
      potentialsTrainees: [],
    };
  },
  async created () {
    await this.refreshAttendances(this.course.slots.map(s => s._id));
    if (!this.potentialsTrainees.length) await this.getTrainees();
  },
  computed: {
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
    noSlots () {
      return !this.course.slots.length;
    },
    learners () {
      return [...this.course.trainees, ...this.unsubscribedLearners];
    },
    unsubscribedLearners () {
      const learnersId = this.course.trainees.map(learner => learner._id);
      const unsubscribedLearnersId = [...new Set(this.attendances
        .filter(a => (!learnersId.includes(a.trainee)))
        .map(u => u.trainee))];

      return unsubscribedLearnersId
        .map(unsubscribedLearnerId => this.potentialsTrainees.find(trainee => trainee._id === unsubscribedLearnerId))
        .map(unsubscribedLearner => ({ ...unsubscribedLearner, external: true }));
    },
    traineeFilterOptions () {
      const formattedTrainees = this.potentialsTrainees
        .map(trainee => ({
          label: formatIdentity(trainee.identity, 'FL'),
          value: { identity: trainee.identity, _id: trainee._id, external: true },
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      return uniqBy(formattedTrainees, 'value')
        .filter(learner => !this.learners.map(l => l._id).includes(learner.value._id));
    },
    selectedCompany () {
      return this.course.company ? this.course.company._id : '';
    },
  },
  methods: {
    checkboxValue (traineeId, slotId) {
      if (this.attendances.length) {
        return !!this.attendances.find(a => a.trainee === traineeId && a.courseSlot === slotId);
      }
      return false;
    },
    traineesCount (slotId) {
      return this.attendances.filter(a => a.courseSlot === slotId).length;
    },
    async refreshAttendances (courseSlots) {
      if (courseSlots.length) {
        try {
          this.loading = true;
          const updatedCourseSlot = await Attendances.list({ courseSlots });

          this.attendances = [
            ...this.attendances.filter(a => !courseSlots.some(cs => cs === a.courseSlot)),
            ...updatedCourseSlot,
          ];
          NotifyPositive('Liste mise à jour.');
        } catch (e) {
          console.error(e);
          this.attendances = [];
          NotifyNegative('Erreur lors de la mise à jour des émargements.');
        } finally {
          this.loading = false;
        }
      }
    },
    async updateCheckbox (traineeId, slotId) {
      if (this.checkboxValue(traineeId, slotId)) {
        try {
          this.loading = true;
          const attendance = this.attendances.find(a => a.trainee === traineeId && a.courseSlot === slotId);
          await Attendances.delete(attendance._id);

          await this.refreshAttendances([slotId]);
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

          await this.refreshAttendances([slotId]);
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
        this.potentialsTrainees = await Users.learnerList(this.course.type === INTRA
          ? { company: this.selectedCompany }
          : { hasCompany: true });
      } catch (error) {
        console.error(error);
      }
    },
    async addLearner (event) {
      try {
        if (!event.trainee._id) return NotifyWarning('Veuillez sélectionner un participant');
        this.modalLoading = true;
        event.slots.map(s => this.updateCheckbox(event.trainee._id, s));
        this.unsubscribedLearners.push(event.trainee);
        this.traineeAdditionModal = false;
        NotifyPositive('Participant ajouté.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'ajout du participant.');
      } finally {
        this.modalLoading = false;
      }
    },
    resetSelectedTrainee () {
      this.selectedTrainee = {};
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
.add-learner
  padding-left: 16px
  padding-bottom: 16px
  border-color: 'transparent'
.unsubscribed
    color: $secondary
    line-height: 1
    font-size: 11px
    font-style: italic
    padding-top: 3px
</style>
