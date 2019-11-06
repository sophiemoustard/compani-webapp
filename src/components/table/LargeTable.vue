<template>
  <q-table :data="data" :columns="columns" :pagination="pagination" binary-state-sort :row-key="rowKey"
    class="q-pa-sm large-table neutral-background" flat :rows-per-page-options="rowsPerPageOptions"
    :selection="selection" :selected="selected" :visible-columns="visibleColumns" :loading="loading"
    @update:pagination="$emit('update:pagination', $event)" @update:selected="$emit('update:selected', $event)">
    <template v-slot:body="props">
      <slot name="body" :props="props" />
    </template>
    <template v-slot:bottom="props">
      <ni-billing-pagination :props="props" :pagination.sync="pagination"
        :data="data"/>
    </template>
  </q-table>
</template>

<script>
import BillingPagination from './BillingPagination';

export default {
  name: 'LargeTable',
  props: {
    data: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    pagination: { type: Object, default: () => ({ page: 1, rowsPerPage: 15 }) },
    loading: { type: Boolean, default: false },
    rowKey: { type: String, default: 'id' },
    rowsPerPageOptions: { type: Array, default: () => [15, 25, 35] },
    selection: { type: String, default: 'none' },
    selected: { type: Array, default: () => [] },
    visibleColumns: Array,
  },
  components: {
    'ni-billing-pagination': BillingPagination,
  },
}
</script>
