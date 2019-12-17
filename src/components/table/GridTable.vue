<template>
  <q-table class="q-mb-xl" :data="data" :columns="columns" hide-bottom flat grid :visible-columns="visibleColumns"
    :rows-per-page-options="[0]">
    <template v-slot:item="props">
        <q-card class="full-width" flat bordered>
          <q-list separator dense>
            <q-item v-for="col in props.cols" :key="col.name">
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
export default {
  name: 'GridTable',
  props: {
    data: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    visibleColumns: Array,
  },
}
</script>

<style lang="stylus" scoped>
  .q-item__section--main
    & > .q-item__label
      font-size: 0.80rem
</style>
