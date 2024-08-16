<template>
  <q-card class="card" flat>
    <div class="text-weight-bold">{{ card.question }}</div>
    <div class="q-mb-lg subtitle">{{ subtitle }}</div>
    <div v-for="(answer, index) in card.answers" :key="index" class="q-mt-sm answer-container bg-peach-100">
      <div class="q-ma-sm">{{ answer }}</div>
    </div>
  </q-card>
</template>

<script>
import { computed, toRefs } from 'vue';
import { formatQuantity } from '@helpers/utils';

export default {
  name: 'OpenQuestionChart',
  props: {
    card: { type: Object, default: () => ({}) },
  },
  setup (props) {
    const { card } = toRefs(props);
    const subtitle = computed(() => `${formatQuantity('réponse', card.value.answers.length)} à cette question ouverte`);

    return {
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
</style>
