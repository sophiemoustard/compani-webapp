<template>
  <q-table :data="data" :columns="columns" :loading="loading" flat :row-key="rowKey" binary-state-sort
    :pagination="pagination" class="table-list neutral-background" :hide-bottom="pagination.rowsPerPage === 0"
    :rows-per-page-options="[]" @update:pagination="$emit('update:pagination', $event)"
    :visible-columns="formattedVisibleColumns">
    <template v-slot:body="props">
      <slot name="body" :props="props">
        <q-tr :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :props="props" :data-label="col.label" :style="col.style"
            :class="col.name">
            {{ col.value }}
          </q-td>
        </q-tr>
      </slot>
    </template>
  </q-table>
</template>

<script>
export default {
  name: 'TableList',
  props: {
    data: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    visibleColumns: { type: Array, default: () => [] },
    pagination: { type: Object, default: () => ({ rowsPerPage: 0 }) },
    loading: { type: Boolean, default: false },
    rowKey: { type: String, default: 'name' },
  },
  computed: {
    formattedVisibleColumns () {
      return this.visibleColumns.length ? this.visibleColumns : this.columns.map(col => col.name);
    },
  },
}
</script>
