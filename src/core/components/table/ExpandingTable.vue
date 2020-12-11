<template>
  <q-table :data="data" :columns="columns" hide-bottom class="q-pa-md">
      <template #header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th v-for="col in props.cols" :key="col.name" :props="props"> {{ col.label }} </q-th>
        </q-tr>
      </template>

      <template #body="props">
        <q-tr :props="props" @click="props.expand = !props.expand" class="cursor-pointer">
          <q-td auto-width />
          <slot name="row" :props="props" />
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <slot name="expanding-row" v-show="props.expand" :props="props" />
        </q-tr>
      </template>
    </q-table>
</template>

<script>
export default {
  name: 'ExpandingTable',
  props: {
    data: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
  },
};
</script>
