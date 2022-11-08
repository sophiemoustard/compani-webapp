<template>
  <div>
    <div class="q-mb-xl">
      <div class="row">
        <p class="text-weight-bold table-title">Structures ({{ companiesNumber }})</p>
      </div>
      <q-card>
        <ni-responsive-table :data="companies" :columns="columns" v-model:pagination="pagination"
          no-data-label="Aucune structure n’est rattachée à la formation." :hide-bottom="!!companies.length">
          <template #body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                {{ col.value }}
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
      </q-card>
    </div>
  </div>
</template>

<script>
import { computed, ref, toRefs } from 'vue';
import get from 'lodash/get';
import ResponsiveTable from '@components/table/ResponsiveTable';

export default {
  name: 'CompanyTable',
  props: {
    companies: { type: Array, default: () => [] },
  },
  components: {
    'ni-responsive-table': ResponsiveTable,
  },
  emits: ['refresh', 'update'],
  setup (props, { emit }) {
    const { companies } = toRefs(props);
    const columns = ref([
      {
        name: 'name',
        label: 'Nom',
        align: 'left',
        field: row => get(row, 'name'),
        classes: 'text-capitalize',
      },
    ]);
    const pagination = ref({ rowsPerPage: 0, sortBy: 'name' });

    const companiesNumber = computed(() => companies.value.length);

    return {
      // Data
      columns,
      pagination,
      // Validations
      // Computed
      companiesNumber,
      // Methods
      get,
    };
  },
};
</script>
