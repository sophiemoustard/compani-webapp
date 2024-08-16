<template>
  <q-card class="card" flat>
    <div class="row justify-between q-my-sm">
      <span class="text-weight-bold col-xs-10">{{ card.question }}</span>
      <ni-bi-color-button class="col-xs-2" icon="content_copy" label="Copier les réponses" @click="copyAnswers"
        size="14px" :disable="!card.answers.length" />
    </div>
    <span class="subtitle">{{ subtitle }}</span>
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
import { copyToClipboard } from 'quasar';
import { formatQuantity } from '@helpers/utils';
import TableList from '@components/table/TableList';
import BiColorButton from '@components/BiColorButton';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';

export default {
  name: 'OpenQuestionChart',
  props: {
    card: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-table-list': TableList,
    'ni-bi-color-button': BiColorButton,
  },
  setup (props) {
    const { card } = toRefs(props);

    const columns = ref([{ name: 'answer', field: 'answer', align: 'left' }]);
    const pagination = ref({ page: 1, rowsPerPage: 10 });
    const rowsPerPageOptions = ref([10, 20, 50, 100]);

    const subtitle = computed(() => `${formatQuantity('réponse', card.value.answers.length)} à cette question ouverte`);

    const copyAnswers = () => {
      copyToClipboard(card.value.answers.join(' \n'))
        .then(() => NotifyPositive('Réponses copiées !'))
        .catch(() => NotifyNegative('Erreur lors de la copie des réponses.'));
    };

    return {
      // Data
      columns,
      pagination,
      rowsPerPageOptions,
      // Computed
      subtitle,
      // Methods
      copyAnswers,
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

.answer
  padding: 12px
  margin: 2px 0px

:deep(.table-list)
  .q-table
    border-spacing: 0px
  & tbody
    & td
      padding: 0px
      .q-item__section--main
        font-size: 12px
  & .q-btn-toggle
    background-color: $copper-grey-100
</style>
