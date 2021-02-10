<template>
  <q-card flat>
    <q-table v-if="!noSlots" :data="course.trainees" :columns="columns" class="q-pa-md table"
      separator="none" :hide-bottom="!noTrainees" :loading="loading" :pagination="{ rowsPerPage: 0 }">
      <template #header="props">
        <q-tr :props="props">
          <q-th v-for="col in props.cols" :key="col.name" :props="props" class="header">
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
            <div v-if="col.name === 'trainee'">
              <q-item>
                <q-item-section avatar>
                  <img class="avatar" :src="props.row.picture ? props.row.picture.link : DEFAULT_AVATAR">
                </q-item-section>
                <q-item-section>{{ formatIdentity(col.value, 'FL') }}</q-item-section>
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
    <div v-if="noSlots" class="text-center text-italic q-pa-lg no-data">
      Aucun créneau n'a été ajouté à cette formation
    </div>
  </q-card>
</template>

<script>
import moment from '@helpers/moment';
import { upperCaseFirstLetter, formatIdentity } from '@helpers/utils';
import { DEFAULT_AVATAR } from '@data/constants';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import Attendances from '@api/Attendances';

export default {
  name: 'AttendanceTable',
  props: {
    course: { type: Object, default: () => ({}) },
  },
  data () {
    return {
      formatIdentity,
      DEFAULT_AVATAR,
      attendances: [],
      loading: false,
    };
  },
  async created () {
    await this.refreshAttendances(this.course.slots.map(s => s._id));
  },
  computed: {
    columns () {
      const columns = [{
        name: 'trainee',
        align: 'left',
        field: 'identity',
        style: !this.$q.platform.is.mobile ? 'max-width: 250px' : 'max-width: 150px',
        classes: 'ellipsis',
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
.header
  border-right: 1px solid $grey-200;
.table
  thead tr:first-child th:first-child
    background-color: white

  td:first-child
    background-color: white

  th:first-child
  td:first-child
    position: sticky
    left: 0
    z-index: 1
</style>
