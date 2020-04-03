<template>
  <div class="relative-position table-spinner-container">
    <q-table v-if="!loading" :data="data" :columns="columns" :row-key="rowKey" flat :pagination="pagination" class="neutral-background"
      :hide-bottom="pagination.rowsPerPage === 0" :visible-columns="visibleColumns" :rows-per-page-options="[]"
      v-on="$listeners" :loading="loading">
      <template v-if="$scopedSlots['top-row']" v-slot:top-row="props">
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
        <slot name="bottom-row" :props="props" />
      </template>
    </q-table>
    <q-inner-loading :showing="loading">
      <q-spinner-facebook size="30px" color="primary" />
    </q-inner-loading>
  </div>
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
    loading: { type: Boolean, default: false },
  },
}
</script>
