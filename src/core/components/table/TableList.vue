<template>
  <div class="relative-position table-spinner-container">
    <q-table v-if="!loading" :rows="data" :columns="columns" flat :row-key="rowKey" binary-state-sort
      :pagination="pagination" class="table-list" :rows-per-page-options="[]" @update:pagination="update($event)"
      :visible-columns="formattedVisibleColumns">
      <template #body="props">
        <q-tr :no-hover="disabled" :props="props" @click="click(props.row)">
          <q-td v-for="col in props.cols" :key="col.name" :props="props" :data-label="col.label" :style="col.style"
            :class="col.name">
            <slot name="body" :props="props" :col="col">
              <template v-if="col.value">{{ col.value }}</template>
            </slot>
          </q-td>
        </q-tr>
      </template>
      <template #no-data>
        <div v-show="!loading" class="full-width row q-gutter-sm text-copper-grey-800">
          <span>Pas de données disponibles</span>
        </div>
      </template>
      <template #bottom="props" v-if="rowsPerPage.length">
        <ni-pagination :props="props" :pagination="pagination" :data="data" :options="paginationOptions"
          @update:pagination="update($event)" />
      </template>
    </q-table>
    <div v-else class="loading-container" />
    <q-inner-loading :showing="loading">
      <q-spinner-facebook size="30px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script>
import Pagination from '@components/table/Pagination';

export default {
  name: 'TableList',
  props: {
    data: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    visibleColumns: { type: Array, default: () => [] },
    pagination: { type: Object, default: () => ({ rowsPerPage: 0 }) },
    loading: { type: Boolean, default: false },
    rowKey: { type: String, default: 'name' },
    disabled: { type: Boolean, default: false },
    rowsPerPage: { type: Array, default: () => [15, 50, 100] },
  },
  components: {
    'ni-pagination': Pagination,
  },
  computed: {
    formattedVisibleColumns () {
      return this.visibleColumns.length ? this.visibleColumns : this.columns.map(col => col.name);
    },
    paginationOptions () {
      return this.rowsPerPage.filter(o => o <= this.data.length);
    },
  },
  methods: {
    click (row) {
      if (this.disabled) return;
      this.$emit('go-to', row);
    },
    update (event) {
      this.$emit('update:pagination', event);
    },
  },
};
</script>
