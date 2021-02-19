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
      @click="traineeAdditionModal = true" />
    <div v-if="noSlots" class="text-center text-italic q-pa-lg no-data">
      Aucun créneau n'a été ajouté à cette formation
    </div>
  </q-card>
    <learner-addition-modal v-model="traineeAdditionModal" :course="course" @hide="resetSelectedTrainee"
      @submit="addLearner" :loading="modalLoading" :learners="learners" :selected-trainee.sync="selectedTrainee" />
</div>
</template>

<script>
import moment from '@helpers/moment';
import { upperCaseFirstLetter, formatIdentity } from '@helpers/utils';
import { DEFAULT_AVATAR } from '@data/constants';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import Button from '@components/Button';
import Attendances from '@api/Attendances';
import Users from '@api/Users';
import LearnerAdditionModal from './LearnerAdditionModal';

export default {
  name: 'AttendanceTable',
  props: {
    course: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-button': Button,
    'learner-addition-modal': LearnerAdditionModal,
  },
  data () {
    return {
      formatIdentity,
      DEFAULT_AVATAR,
      attendances: [],
      loading: false,
      modalLoading: false,
      traineeAdditionModal: false,
      unsubscribedLearners: [],
      selectedTrainee: {},
    };
  },
  async created () {
    await this.refreshAttendances(this.course.slots.map(s => s._id));
    const learnersId = this.learners.map(learner => learner._id);
    const unsubscribedLearnersId = [...new Set(this.attendances
      .filter(a => (!learnersId.includes(a.trainee)))
      .map(u => u.trainee))];

    this.unsubscribedLearners = await Promise.all(unsubscribedLearnersId
      .map(unsubscribedLearnerId => Users.getById(unsubscribedLearnerId)));

    this.unsubscribedLearners = this.unsubscribedLearners
      .map(unsubscribedLearner => ({ ...unsubscribedLearner, external: true }));
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
      return this.course.trainees.concat(this.unsubscribedLearners);
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
    async addLearner (event) {
      try {
        if (!event.trainee) return NotifyWarning('Veuillez sélectionner un participant');
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
    padding-top: 3px
</style>
