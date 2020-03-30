<template functional>
  <q-table :data="props.data" :columns="props.columns" :row-key="props.rowKey" flat :pagination="props.pagination"
    :hide-bottom="props.pagination.rowsPerPage === 0" :visible-columns="props.visibleColumns" class="neutral-background"
    :rows-per-page-options="[]" v-on="listeners">
    <template v-if="scopedSlots['top-row']" v-slot:top-row="props">
      <slot name="top-row" :props="props" />
    </template>
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
    <template v-slot:bottom-row="props">
      <slot name="bottom-row" :props="props" /></template>
  </q-table>
</template>

<script>
export default {
  name: 'SimpleTable',
  props: {
    data: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    rowKey: { type: String, default: 'name' },
    visibleColumns: Array,
    pagination: { type: Object, default: () => ({ rowsPerPage: 0 }) },
  },
}
</script>
