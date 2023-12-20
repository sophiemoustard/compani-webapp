<template>
  <div v-if="!!trainerMissions.length"
    class="q-mb-xl">
    <p class="text-weight-bold">Ordres de mission</p>
    <div class="q-mb-sm">
      <q-card>
        <ni-responsive-table :data="trainerMissions" :columns="columns" v-model:pagination="pagination"
          :loading="loading" :rows-per-page-options="[5, 10, 15, 20]" :hide-bottom="false">
          <template #body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props"
                :style="col.style" :class="[{ 'border': props.rowIndex === 0 }]">
                <template v-if="col.name === 'actions'">
                  <ni-button icon="file_download" color="primary" type="a" :href="props.row.file.link"
                    :disable="!props.row.file.link" />
                </template>
                <template v-if="col.name === 'courses'">
                  <div v-for="course of props.row.courses" :key="course._id" class="q-mb-xs course">
                    <router-link class="clickable-name" :to="gotToCourse(course._id)">
                      {{ composeCourseName(course, true) }}
                    </router-link>
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
      </q-card>
    </div>
  </div>
  <div v-else class="text-italic">Pas d'ordres de mission</div>
</template>

<script>
import { ref } from 'vue';
import Button from '@components/Button';
import ResponsiveTable from '@components/table/ResponsiveTable';
import CompaniDate from '@helpers/dates/companiDates';
import { DD_MM_YYYY } from '@data/constants';
import { formatPrice } from '@helpers/utils';
import { composeCourseName } from '@helpers/courses';

export default {
  name: 'TrainerMissionTable',
  props: {
    loading: { type: Boolean, default: false },
    trainerMissions: { type: Array, default: () => [] },
  },
  components: {
    'ni-button': Button,
    'ni-responsive-table': ResponsiveTable,
  },
  emits: ['refresh'],
  setup () {
    const pagination = ref({ rowsPerPage: 5, sortBy: 'date', descending: true });
    const columns = ref([
      {
        name: 'date',
        label: 'Date',
        align: 'left',
        field: 'date',
        format: value => CompaniDate(value).format(DD_MM_YYYY),
      },
      {
        name: 'courses',
        label: 'Formation',
        align: 'left',
        field: 'courses',
        style: 'width: 70%',
      },
      {
        name: 'fee',
        label: 'Frais de formateur',
        align: 'center',
        field: 'fee',
        format: formatPrice,
        classes: 'text-weight-bold',
      },
      { name: 'actions', label: '', align: 'right', field: '' },
    ]);

    const gotToCourse = courseId => ({
      name: 'ni management blended courses info',
      params: { courseId },
      query: { defaultTab: 'organization' },
    });

    return {
      // Data
      columns,
      pagination,
      // Methods
      composeCourseName,
      gotToCourse,
    };
  },
};
</script>

<style lang="sass" scoped>
.course
  @media screen and (max-width: 767px)
    text-align: left
  @media screen and (max-width: 840px)
    margin-left: 4px
.course:first-child
  @media screen and (max-width: 767px)
    margin-top: 24px
</style>
