<template>
  <ni-responsive-table :data="trainingContracts" :columns="columns" v-model:pagination="pagination" separator="none"
    :loading="loading">
    <template #header="{ props }">
      <q-tr :props="props">
        <q-th v-for="col in props.cols" :key="col.name" :props="props" :style="col.style">
          {{ col.label }}
        </q-th>
      </q-tr>
    </template>
    <template #body="{ props }">
      <q-tr :props="props">
        <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props"
          :style="col.style" :class="[{ 'border': props.rowIndex === 0 }]">
          <template v-if="col.name === 'actions'">
            <div>
              <ni-button icon="file_download" color="primary" type="a" :href="props.row.file.link"
                :disable="!props.row.file.link" />
              <ni-button icon="delete" @click="deleteTrainingContract(props.row._id)" :disable="isArchived" />
            </div>
          </template>
          <template v-else>{{ col.value }}</template>
        </q-td>
      </q-tr>
    </template>
  </ni-responsive-table>
</template>

<script>
import { ref, toRefs } from 'vue';
import get from 'lodash/get';
import Button from '@components/Button';
import ResponsiveTable from '@components/table/ResponsiveTable';

export default {
  name: 'TrainingContractTable',
  props: {
    trainingContracts: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    companyOptions: { type: Array, default: () => [] },
  },
  components: {
    'ni-button': Button,
    'ni-responsive-table': ResponsiveTable,
  },
  emits: ['delete', 'download'],
  setup (props, { emit }) {
    const { companyOptions } = toRefs(props);
    const pagination = ref({ rowsPerPage: 0, sortBy: 'lastname' });
    const columns = ref([
      {
        name: 'company',
        label: 'Structure',
        align: 'left',
        field: row => companyOptions.value.find(option => get(row, 'company') === option.value).label || '',
      },
      { name: 'actions', label: '', align: 'right', field: '' },
    ]);

    const deleteTrainingContract = trainingContractId => emit('delete', trainingContractId);

    return {
      // Data
      columns,
      pagination,
      // Methods
      deleteTrainingContract,
    };
  },
};
</script>
<style lang="sass" scoped>
.q-table tbody td
  height: 35px
.border
  @media screen and (min-width: 767px)
    border-top: 1px solid $copper-grey-200
</style>
