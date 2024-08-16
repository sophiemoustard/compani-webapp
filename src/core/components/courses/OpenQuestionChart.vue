<template>
  <q-card class="card" flat>
    <div class="text-weight-bold">{{ card.question }}</div>
    <div class="subtitle">{{ subtitle }}</div>
    <ni-table-list :data="card.answers.map(a => ({ answer: a }))" :columns="columns"
      v-model:pagination="pagination" :rows-per-page-options="rowsPerPageOptions" :hide-header="true" :disabled="true">
      <template #body="{ col }">
        <q-item-section class="bg-peach-100 answer">{{ col.value }}</q-item-section>
      </template>
    </ni-table-list>
  </q-card>
</template>

<script>
import { computed, toRefs, ref } from 'vue';
import { formatQuantity } from '@helpers/utils';
import TableList from '@components/table/TableList';

export default {
  name: 'OpenQuestionChart',
  props: {
    card: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-table-list': TableList,
  },
  setup (props) {
    const { card } = toRefs(props);

    const columns = ref([{ name: 'answer', field: 'answer', align: 'left' }]);
    const pagination = ref({ page: 1, rowsPerPage: 5 });
    const rowsPerPageOptions = ref([5, 10, 20, 50, 100]);

    const subtitle = computed(() => `${formatQuantity('réponse', card.value.answers.length)} à cette question ouverte`);

    return {
      // Data
      columns,
      pagination,
      rowsPerPageOptions,
      // Computed
      subtitle,
    };
  },
};
</script>

<style lang="sass" scoped>
.card
  padding: 16px 32px
.subtitle
  color: $copper-grey-800
  font-size: 14px
.answer-container
  border-radius: 3px !important
  font-size: 14px
  display: flex

:deep(.table-list)
  .q-table
    border-spacing: 0px
  & tbody
    & td
      padding: 0px
  & .q-btn-toggle
    background-color: $peach-100
    opacity: 0.8

.answer
  padding: 8px 16px
</style>
