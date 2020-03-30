<template functional>
  <q-table :data="props.data" :columns="props.columns" :row-key="props.rowKey" :pagination="props.pagination"
    :visible-columns="props.visibleColumns" hide-bottom binary-state-sort flat :separator="props.separator"
    class="table-responsive q-pa-sm" :rows-per-page-options="props.rowsPerPageOptions" v-on="listeners">
    <template v-slot:header="props">
      <slot name="header" :props="props">
        <q-tr :props="props">
          <q-th v-for="col in props.cols" :key="col.name" :props="props" :style="col.style">{{ col.label }}</q-th>
        </q-tr>
      </slot>
    </template>
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
    rowKey: { type: String, default: 'name' },
    rowsPerPageOptions: { type: Array, default: () => [15, 25, 35] },
    visibleColumns: Array,
    separator: { type: String, default: 'horizontal' },
  },
}
</script>
