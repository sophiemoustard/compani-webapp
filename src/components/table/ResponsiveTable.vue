<template>
  <q-table :data="data" :columns="columns" :row-key="rowKey" :pagination="pagination" :visible-columns="visibleColumns"
    hide-bottom binary-state-sort @update:pagination="$emit('update:pagination', $event)" flat
    class="table-responsive q-pa-sm">
    <template v-slot:body="props">
      <slot name="body" :props="props">
        <q-tr :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
            :style="col.style">
            {{ col.value }}
          </q-td>
        </q-tr>
      </slot>
    </template>
  </q-table>
</template>

<script>
export default {
  name: 'ResponsiveTable',
  props: {
    data: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    pagination: { type: Object, default: () => ({ page: 1, rowsPerPage: 15 }) },
    loading: { type: Boolean, default: false },
    rowKey: { type: String, default: 'name' },
    rowsPerPageOptions: { type: Array, default: () => [15, 25, 35] },
    selection: { type: String, default: 'none' },
    selected: { type: Array, default: () => [] },
    separator: { type: String, default: 'horizontal' },
    visibleColumns: Array,
  },
}
</script>
