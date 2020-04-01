<template>
  <q-table :data="data" :columns="columns" :loading="loading" flat :row-key="rowKey" binary-state-sort
    :pagination="pagination" class="table-list neutral-background" :hide-bottom="pagination.rowsPerPage === 0"
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
    <template v-slot:loading>
      <q-inner-loading showing class="neutral-background">
        <q-spinner-facebook size="30px" color="primary" />
      </q-inner-loading>
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

<style lang="stylus" scoped>
/deep/ .q-inner-loading {
  opacity: 0.6;
}
</style>
