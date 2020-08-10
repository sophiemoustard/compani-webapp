<template>
  <div class="relative-position table-spinner-container">
    <q-table v-if="!loading" :data="data" :columns="columns" flat :row-key="rowKey" binary-state-sort
      :pagination="pagination" class="table-list" :hide-bottom="(!!data.length && pagination.rowsPerPage === 0)"
      :rows-per-page-options="[]" @update:pagination="$emit('update:pagination', $event)"
      :visible-columns="formattedVisibleColumns">
      <template v-slot:body="props">
        <q-tr :props="props" @click="$emit('goTo', props.row)">
          <q-td v-for="col in props.cols" :key="col.name" :props="props" :data-label="col.label" :style="col.style"
            :class="col.name">
            <slot name="body" :props="props" :col="col">
              <template v-if="col.value">{{ col.value }}</template>
            </slot>
          </q-td>
        </q-tr>
      </template>
      <template v-slot:no-data>
        <div v-show="!loading" class="full-width row q-gutter-sm grey-text">
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
