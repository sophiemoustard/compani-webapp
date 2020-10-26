<template>
  <q-card class="card" flat>
    <div class="text-weight-bold">{{ card.question }}</div>
    <div class="q-mb-lg subtitle">{{ subtitle }}</div>
    <div v-for="(answer, index) in card.answers" :key="index" class="q-mt-sm bar-container">
      {{ answer }}
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
      return `${this.card.answers.length} réponses à cette carte question ouverte`;
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
.percentage
  text-align: center
  width: 56px
.bar-container
  display: flex
  align-items: center
.bar
  color: $middle-beige
  background-color: $neutral-beige
/deep/ .q-linear-progress__track
  opacity: 0
.bar-label
  font-size: 14px
  position: absolute
  color: black
  display: flex
  justify-content: space-between
  width: 100%
  align-items: center
  height: 100%
  padding: 0 24px
</style>
