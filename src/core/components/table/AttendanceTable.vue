<template>
  <q-card>
    <q-table :data="course.trainees" :columns="columns" class="q-pa-md" hide-bottom :pagination="{ rowsPerPage: 0 }">
      <template #header="props">
        <q-tr :props="props">
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            <div v-if="col.name !== 'trainees'">
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
            <div v-if="col.name === 'trainees'">
              <q-item>
                <q-item-section avatar>
                  <img class="avatar" :src="props.row.picture ? props.row.picture.link : DEFAULT_AVATAR">
                </q-item-section>
                <q-item-section>{{ formatIdentity(col.value, 'FL') }}</q-item-section>
              </q-item>
            </div>
            <q-checkbox v-else :value="false" dense size="sm" />
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

export default {
  name: 'ExpandingTable',
  props: {
    course: { type: Object, default: () => ({}) },
  },
  data () {
    return {
      formatIdentity,
      DEFAULT_AVATAR,
    };
  },
  computed: {
    columns () {
      const columns = [{
        name: 'trainees',
        align: 'left',
        field: 'identity',
        style: 'max-width: 200px',
        classes: 'ellipsis',
      }];
      if (!this.course.slots) return columns;

      return [
        ...columns,
        ...this.course.slots.map(s => ({
          name: s._id,
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
};
</script>
<style lang="stylus" scoped>
.number
  font-size: 24px
.date
  font-size: 16px
</style>
