<template>
  <div class="relative-position table-spinner-container">
    <q-table v-if="!loading" :data="data" :columns="columns" :pagination="pagination" binary-state-sort :row-key="rowKey"
      class="q-pa-sm large-table" flat :separator="separator" :selection="selection"
      :selected="selected" :visible-columns="visibleColumns"
      @update:pagination="$emit('update:pagination', $event)" @update:selected="$emit('update:selected', $event)">
      <template v-slot:header="props">
        <slot name="header" :props="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" :style="col.style">{{ col.label }}</q-th>
          </q-tr>
        </slot>
      </template>
      <template v-slot:body="props">
        <slot name="body" :props="props" />
      </template>
      <template v-slot:bottom="props">
        <ni-pagination :props="props" :pagination.sync="pagination" :data="data"/>
      </template>
      <template v-slot:no-data>
        <div v-show="!loading" class="full-width row q-gutter-sm">
          <span>Pas de données disponibles</span>
        </div>
      </template>
    </q-table>
    <div v-else class="loading-container" />
    <q-inner-loading :showing="loading">
      <q-spinner-facebook size="30px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script>
import Pagination from '@components/table/Pagination';

export default {
  name: 'LargeTable',
  props: {
    data: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    pagination: { type: Object, default: () => ({ page: 1, rowsPerPage: 15 }) },
    loading: { type: Boolean, default: false },
    rowKey: { type: [String, Function], default: 'id' },
    selection: { type: String, default: 'none' },
    selected: { type: Array, default: () => [] },
    separator: { type: String, default: 'horizontal' },
    visibleColumns: Array,
  },
  components: {
    'ni-pagination': Pagination,
  },
}
</script>
