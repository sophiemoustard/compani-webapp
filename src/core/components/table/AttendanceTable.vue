<template>
  <q-card>
    <q-table :data="course.trainees" :columns="columns" class="q-pa-md" hide-bottom>
      <template #header="props">
        <q-tr :props="props">
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            <div v-if="!['traineeName','traineePicture'].includes(col.name)">
              <div class="text-primary date">{{ col.month }}</div>
              <div class="number">{{ col.day }}</div>
              <div class="text-weight-bold date">{{ col.weekDay }}</div>
              <div class="text-grey">
                <div>{{ col.startHour }}</div>
                <div>{{ col.endHour }}</div>
              </div>
              <div class="text-grey-800">
                <q-icon name="supervisor_account" />
                {{ col.trainees }}
              </div>
            </div>
          </q-th>
        </q-tr>
      </template>
      <template #body="props">
        <q-tr :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <img v-if="col.name === 'traineePicture'" class="q-mx-md avatar"
              :src="col.value ? col.value.link : DEFAULT_AVATAR">
            <div v-else-if="col.name === 'traineeName'">
              {{ formatIdentity(col.value, 'FL') }}
            </div>
            <q-checkbox v-else :value="false" dense size="sm" />
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <ni-button class="q-my-sm" icon="add" color="primary" label="Ajouter un participant" />
  </q-card>
</template>

<script>
import moment from '@helpers/moment';
import Button from '@components/Button';
import { upperCaseFirstLetter, formatIdentity } from '@helpers/utils';
import { DEFAULT_AVATAR } from '@data/constants';

export default {
  name: 'ExpandingTable',
  props: {
    course: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-button': Button,
  },
  data () {
    return {
      formatIdentity,
      DEFAULT_AVATAR,
    };
  },
  computed: {
    columns () {
      const columns = this.course.slots.map(s => ({
        name: s._id,
        field: '_id',
        align: 'center',
        style: 'width: 80px',
        month: upperCaseFirstLetter(moment(s.startDate).format('MMM')),
        day: moment(s.startDate).day(),
        weekDay: upperCaseFirstLetter(moment(s.startDate).format('ddd')),
        startHour: moment(s.startDate).format('LT'),
        endHour: moment(s.endDate).format('LT'),
        trainees: 0,
      }));
      columns.unshift({ name: 'traineeName', align: 'left', field: 'identity' });
      columns.unshift({ name: 'traineePicture', align: 'left', field: 'picture', style: 'width: 20px' });
      return columns;
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
