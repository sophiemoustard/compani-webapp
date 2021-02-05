<template>
  <q-card flat>
    <q-table :data="course.trainees" :columns="columns" class="q-pa-md table" :pagination="{ rowsPerPage: 0 }"
      separator="none" hide-bottom :loading="loading">
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
                {{ col.traineesCount }}
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
              @input="updateCheckbox(col.value, col.slot)" />
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-card>
</template>

<script>
import moment from '@helpers/moment';
import { upperCaseFirstLetter, formatIdentity } from '@helpers/utils';
import { DEFAULT_AVATAR } from '@data/constants';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import Attendances from '@api/Attendances';

export default {
  name: 'ExpandingTable',
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
    await this.refreshAttendances();
  },
  computed: {
    columns () {
      const columns = [{
        name: 'trainee',
        align: 'left',
        field: 'identity',
        style: 'width: 200px',
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
          style: 'width: 80px',
          month: upperCaseFirstLetter(moment(s.startDate).format('MMM')),
          day: moment(s.startDate).day(),
          weekDay: upperCaseFirstLetter(moment(s.startDate).format('ddd')),
          startHour: moment(s.startDate).format('LT'),
          endHour: moment(s.endDate).format('LT'),
          traineesCount: 0,
        })),
      ];
    },
  },
  methods: {
    checkboxValue (traineeId, slotId) {
      if (this.attendances !== []) {
        return !!this.attendances.filter(a => a.trainee === traineeId && a.courseSlot === slotId).length;
      }
    },
    async refreshAttendances (courseSlots = this.course.slots.map(s => s._id)) {
      try {
        this.loading = true;
        this.attendances = this.attendances.concat(await Attendances.list({ courseSlots }));

        NotifyPositive('Liste mise à jour.');
      } catch (e) {
        console.error(e);
        this.attendances = [];
        NotifyNegative('Erreur lors de la mise à jour des l\'émargements.');
      } finally {
        this.loading = false;
      }
    },
    async updateCheckbox (traineeId, slotId) {
      if (!this.checkboxValue(traineeId, slotId)) {
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
.table
  display: table
</style>
