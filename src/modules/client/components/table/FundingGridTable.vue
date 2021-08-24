<template>
  <q-table class="q-mb-xl" :data="data" :columns="columns" hide-bottom flat grid :rows-per-page-options="[0]"
    :visible-columns="formattedVisibleColumns">
    <template #item="props">
      <q-card class="full-width q-mb-md" flat bordered>
        <q-list separator dense>
          <q-item v-for="col in filterCols(props.cols)" :key="col.name" class="row">
            <q-item-section class="col-5">
              <q-item-label :data-cy="`col-${col.name}`">{{ col.label }}</q-item-label>
            </q-item-section>
            <q-item-section class="col-7" side>
              <q-item-label caption :data-cy="`col-side-${col.name}`">{{ col.value }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </template>
  </q-table>
</template>

<script>
import { NATURE_OPTIONS, FIXED } from '@data/constants';

export default {
  name: 'FundingGridTable',
  props: {
    data: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    visibleColumns: { type: Array, default: () => [] },
  },
  data () {
    return {
      fixedFundingColumns: ['thirdPartyPayer', 'folderNumber', 'startDate', 'frequency', 'amountTTC', 'careDays'],
      hourlyFundingColumns: [
        'thirdPartyPayer',
        'folderNumber',
        'startDate',
        'frequency',
        'unitTTCRate',
        'careHours',
        'customerParticipationRate',
        'careDays',
      ],
    };
  },
  computed: {
    formattedVisibleColumns () {
      return this.visibleColumns.length ? this.visibleColumns : this.columns.map(col => col.name);
    },
  },
  methods: {
    filterCols (cols) {
      if (this.visibleColumns.length) return cols;

      const isFixed = cols.some(col => NATURE_OPTIONS.some(o => o.label === col.value && o.value === FIXED));

      return isFixed
        ? cols.filter(col => this.fixedFundingColumns.includes(col.name))
        : cols.filter(col => this.hourlyFundingColumns.includes(col.name));
    },
  },
};
</script>

<style lang="stylus" scoped>
  .q-item__section--main
    & > .q-item__label
      font-size: 0.80rem
  .q-item__section--side
    & > .q-item__label
      text-align: right
</style>
