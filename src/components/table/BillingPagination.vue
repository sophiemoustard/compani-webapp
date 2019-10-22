<template>
  <div class="row justify-between full-width custom-bottom">
    <div class="row items-center">
      <q-btn-toggle class="on-left no-shadow" v-model="pagination.rowsPerPage" :options="rowsPerPageOptions"
        toggle-text-color="primary" toggle-color="white" no-caps dense size="12px" />
      <div>Eléments par page</div>
    </div>
    <div class="row items-center">
      <div class="on-left">{{ paginationLabel }}</div>
      <div>
        <q-btn icon="chevron_left" class="no-shadow" :disable="props.isFirstPage" @click="props.prevPage" size="12px"
          dense />
        <q-btn icon="chevron_right" class="no-shadow" :disable="props.isLastPage" @click="props.nextPage" size="12px"
          dense />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BillingPagination',
  props: {
    props: Object,
    data: Array,
    pagination: Object,
  },
  data () {
    return {
      rowsPerPageOptions: [
        { label: '100', value: 100 },
        { label: '200', value: 200 },
        { label: '300', value: 300 },
        { label: 'Tous', value: 0 },
      ],
    };
  },
  computed: {
    firstRowIndex () {
      const { page, rowsPerPage } = this.pagination;
      return (page - 1) * rowsPerPage;
    },
    lastRowIndex () {
      const { page, rowsPerPage } = this.pagination;
      return page * rowsPerPage;
    },
    computedRowNumber () {
      if (this.pagination.rowsPerPage) {
        return this.data.slice(this.firstRowIndex, this.lastRowIndex).length + this.firstRowIndex;
      }
      return this.data.length;
    },
    paginationLabel () {
      const { rowsPerPage } = this.pagination;
      return rowsPerPage
        ? `${this.firstRowIndex + 1}-${Math.min(this.lastRowIndex, this.computedRowNumber)} de ${this.data.length}`
        : `1-${this.data.length} de ${this.data.length}`;
    },
  },
}
</script>

<style lang="stylus" scoped>
  .custom-bottom
    color: rgba(0, 0, 0, 0.54)

  /deep/ .q-btn-group
    & button .q-btn-inner
      font-size: 12px
    & > .q-btn-item:first-child
      border: 1px solid rgba(0,0,0,0.12)
    & > .q-btn-item:not(:last-child)
      border-top: 1px solid rgba(0,0,0,0.12)
      border-right: 1px solid rgba(0,0,0,0.12)
      border-bottom: 1px solid rgba(0,0,0,0.12)
    & > .q-btn-item:last-child
      border-top: 1px solid rgba(0,0,0,0.12)
      border-right: 1px solid rgba(0,0,0,0.12)
      border-bottom: 1px solid rgba(0,0,0,0.12)
      font-weight: bold
</style>
