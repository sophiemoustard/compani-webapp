<template>
  <div class="relative-position table-spinner-container">
    <q-table v-if="!loading" :data="data" :columns="columns" class="q-pa-md" :pagination="pagination">
      <template #header="props">
        <q-tr :props="props">
          <q-th v-for="col in props.cols" :key="col.name" :props="props"> {{ col.label }} </q-th>
        </q-tr>
      </template>
      <template #body="props">
        <q-tr :props="props" @click="props.expand = !props.expand" class="cursor-pointer">
          <slot name="row" :props="props" />
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <slot name="expanding-row" :props="props" />
        </q-tr>
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
  name: 'ExpandingTable',
  props: {
    data: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    pagination: { type: Object, default: () => ({}) },
  },
};
</script>
