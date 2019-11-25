<template>
  <q-table :data="data" :columns="columns" :row-key="rowKey" flat :hide-bottom="pagination.rowsPerPage === 0"
    :pagination="pagination" :visible-columns="visibleColumns" class="neutral-background"
    :rows-per-page-options="[]" @update:pagination="$emit('update:pagination', $event)">
    <template v-slot:top-row="props"><slot name="top-row" :props="props" /></template>
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
    <template v-slot:bottom-row="props"><slot name="bottom-row" :props="props" /></template>
  </q-table>
</template>

<script>
export default {
  name: 'SimpleTable',
  props: {
    data: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    rowKey: { type: String, default: 'name' },
    hideBottom: { type: Boolean, default: true },
    visibleColumns: Array,
    pagination: { type: Object, default: () => ({ rowsPerPage: 0 }) },
  },
}
</script>
