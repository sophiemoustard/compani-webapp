<template>
  <q-table :data="data" :columns="columns" :pagination="pagination" binary-state-sort :row-key="rowKey"
    class="q-pa-sm large-table neutral-background" flat :separator="separator" :selection="selection"
    :selected="selected" :visible-columns="visibleColumns" :loading="loading"
    @update:pagination="$emit('update:pagination', $event)" @update:selected="$emit('update:selected', $event)">
    <template v-slot:header="props">
      <slot name="header" :props="props">
        <q-tr :props="props">
          <q-th v-for="col in props.cols" :key="col.name" :props="props" :style="col.style">{{ col.label }}</q-th>
        </q-tr>
      </slot>
    </template>
    <template v-slot:body="props">
      <slot name="body" :props="props" />
    </template>
    <template v-slot:bottom="props">
      <ni-pagination :props="props" :pagination.sync="pagination" :data="data"/>
    </template>
    <template v-slot:loading>
      <q-inner-loading showing class="neutral-background">
        <q-spinner-facebook size="30px" color="primary" />
      </q-inner-loading>
    </template>
  </q-table>
</template>

<script>
import Pagination from '@components/table/Pagination';

export default {
  name: 'LargeTable',
  props: {
    data: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    pagination: { type: Object, default: () => ({ page: 1, rowsPerPage: 15 }) },
    loading: { type: Boolean, default: false },
    rowKey: { type: [String, Function], default: 'id' },
    selection: { type: String, default: 'none' },
    selected: { type: Array, default: () => [] },
    separator: { type: String, default: 'horizontal' },
    visibleColumns: Array,
  },
  components: {
    'ni-pagination': Pagination,
  },
}
</script>

<style lang="stylus" scoped>
/deep/ .q-inner-loading {
  opacity: 0.6;
}
</style>
