<template>
  <q-card class="card" flat>
    <div class="text-weight-bold">{{ card.question }}</div>
    <div class="q-mb-lg subtitle">{{ subtitle }}</div>
    <div v-for="(answer, index) in card.answers" :key="index" class="q-mt-sm answer-container">
      <div class="q-ma-sm">{{ answer }}</div>
    </div>
  </q-card>
</template>

<script>
import { formatQuantity } from '@helpers/utils';

export default {
  name: 'OpenQuestionChart',
  props: {
    card: { type: Object, default: () => ({}) },
  },
  computed: {
    subtitle () {
      return `${formatQuantity('réponse', this.card.answers.length)} à cette question ouverte`;
    },
  },
};
</script>

<style lang="stylus" scoped>
.card
  padding: 16px 32px
.subtitle
  color: $grey-800
  font-size: 14px
.answer-container
  border-radius: 3px !important
  font-size: 14px
  display: flex
  background-color: $neutral-beige
</style>
