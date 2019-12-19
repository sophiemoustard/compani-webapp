<template>
  <q-table class="q-mb-xl" :data="data" :columns="columns" hide-bottom flat grid :visible-columns="visibleColumns"
    :rows-per-page-options="[0]">
    <template v-slot:item="props">
      <q-card class="full-width q-mb-md" flat bordered>
        <q-list separator dense>
          <q-item v-for="col in filterCols(props.cols)" :key="col.name">
            <q-item-section>
              <q-item-label>{{ col.label }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption>{{ col.value }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </template>
  </q-table>
</template>

<script>
import { NATURE_OPTIONS, FIXED } from '../../data/constants';

export default {
  name: 'GridTable',
  props: {
    data: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    visibleColumns: Array,
  },
  data () {
    return {
      fixedFundingColumns: [
        'thirdPartyPayer',
        'folderNumber',
        'startDate',
        'frequency',
        'amountTTC',
        'customerParticipationRate',
      ],
      otherFundingColumns: [
        'thirdPartyPayer',
        'folderNumber',
        'startDate',
        'frequency',
        'unitTTCRate',
        'careHours',
        'customerParticipationRate',
      ],
    }
  },
  methods: {
    filterCols (cols) {
      if (!this.visibleColumns) {
        const isFixedFunding = cols.some((col) => {
          const natureOption = NATURE_OPTIONS.find(opt => opt.label === col.value);
          return natureOption && natureOption.value === FIXED;
        });

        return isFixedFunding
          ? cols.filter(col => this.fixedFundingColumns.includes(col.name))
          : cols.filter(col => this.otherFundingColumns.includes(col.name));
      }

      return cols;
    },
  },
}
</script>

<style lang="stylus" scoped>
  .q-item__section--main
    & > .q-item__label
      font-size: 0.80rem
</style>
