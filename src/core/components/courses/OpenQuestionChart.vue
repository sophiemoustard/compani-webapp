<template>
  <q-card class="card" flat>
    <div class="text-weight-bold">{{ card.question }}</div>
    <div class="q-mb-lg subtitle">{{ subtitle }}</div>
    <div>
      <div v-for="(answer, index) in card.answers" :key="index"
        class="q-mt-sm answer-container rounded-borders">
        <div class="q-ma-sm" style="display:flex">{{ answer }}</div>
      </div>
    </div>
  </q-card>
</template>

<script>
export default {
  name: 'OpenQuestionChart',
  props: {
    card: { type: Object, default: () => ({}) },
  },
  computed: {
    subtitle () {
      return `${this.card.answers.length} réponses à cette question ouverte`;
    },
  },
};
</script>

<style lang="stylus" scoped>
.card
  padding: 16px 32px
.subtitle
  color: $dark-grey
  font-size: 14px
.answer-container
  font-size: 14px
  display: flex
  background-color: $neutral-beige
</style>
