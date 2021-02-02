<template>
  <q-card>
    <q-table :data="course.trainees" :columns="columns" class="q-pa-md" hide-bottom>
      <template #header="props">
        <q-tr :props="props">
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            <div class="text-primary date">{{ col.month }}</div>
            <div class="number">{{ col.day }}</div>
            <div class="text-weight-bold date">{{ col.weekDay }}</div>
            <div class="text-grey">
              {{ col.startHour }}
              <div>{{ col.endHour }}</div>
            </div>
            <div class="text-grey-800">
              <q-icon name="supervisor_account" />
              {{ col.trainees }}
            </div>
          </q-th>
        </q-tr>
      </template>
      <template #body="props">
        <q-tr :props="props" @click="props.expand = !props.expand" class="cursor-pointer">
          <slot name="row" :props="props" />
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <slot name="expanding-row" :props="props" />
        </q-tr>
      </template>
    </q-table>
  </q-card>
</template>

<script>
import moment from '@helpers/moment';
import { upperCaseFirstLetter } from '@helpers/utils';

export default {
  name: 'ExpandingTable',
  props: {
    course: { type: Object, default: () => ({}) },
  },
  data () {
    return {
    };
  },
  created () {
  },
  computed: {
    columns () {
      return this.course.slots.map(s => ({
        name: s._id,
        field: '_id',
        align: 'center',
        month: upperCaseFirstLetter(moment(s.startDate).format('MMM')),
        day: moment(s.startDate).day(),
        weekDay: upperCaseFirstLetter(moment(s.startDate).format('ddd')),
        startHour: moment(s.startDate).format('LT'),
        endHour: moment(s.endDate).format('LT'),
        trainees: 0,
      }));
    },
  },
};
</script>
<style lang="stylus" scoped>
.number
  font-size: 24px
.date-time
  font-size: 16px
</style>
