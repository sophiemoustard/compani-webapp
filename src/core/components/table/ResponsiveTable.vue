<template>
  <div class="relative-position table-spinner-container">
    <q-table v-if="!loading" :data="data" :columns="columns" :row-key="rowKey" :pagination="pagination"
      binary-state-sort :visible-columns="visibleColumns" flat :separator="separator" hide-bottom
      :rows-per-page-options="rowsPerPageOptions" class="table-responsive q-pa-sm" v-on="$listeners">
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
              :style="col.style" :data-cy="`col-${col.name}`">
              {{ col.value }}
            </q-td>
          </q-tr>
        </slot>
      </template>
    </q-table>
    <div v-else class="loading-container" />
    <q-inner-loading :showing="loading">
      <q-spinner-facebook size="30px" color="primary" />
    </q-inner-loading>
  </div>
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
    loading: { type: Boolean, default: false },
  },
}
</script>
