<template>
  <q-table :data="data" :columns="columns" row-key="name" hide-bottom flat
  :visible-columns="visibleColumns" class="neutral-background">
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
  </q-table>
</template>

<script>
export default {
  name: 'SimpleTable',
  props: {
    data: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    rowKey: { type: String, default: 'name' },
    visibleColumns: Array,
  },
}
</script>
