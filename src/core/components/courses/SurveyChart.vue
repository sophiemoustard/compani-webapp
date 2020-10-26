<template>
  <q-card class="card" flat>
    <div class="text-weight-bold">{{ card.question }}</div>
    <div class="q-mb-lg subtitle">{{ subtitle }}</div>
    <div v-for="(line, index) in lines" :key="index" class="q-mt-sm bar-container">
      <div class="q-mr-sm percentage">{{ formatPercentage(line.percentage) }}</div>
      <q-linear-progress size="40px" :value="line.percentage" rounded class="bar">
        <div class="bar-label">
          <div>{{ line.title }}</div>
          <div><span class="text-weight-bold">{{ line.total }}</span> réponses</div>
        </div>
      </q-linear-progress>
    </div>
  </q-card>
</template>

<script>
import { formatQuantity, roundFrenchPercentage } from '@helpers/utils';

export default {
  name: 'SurveyChart',
  props: {
    card: { type: Object, default: () => ({}) },
  },
  computed: {
    subtitle () {
      return `${formatQuantity('réponse', this.card.answers.length)} à ce sondage`;
    },
    lines () {
      return ['1', '2', '3', '4', '5'].map((pa) => {
        const total = this.card.answers.filter(a => a === pa).length;

        return { title: pa, total, percentage: total / this.card.answers.length };
      });
    },
  },
  methods: {
    formatPercentage (number) {
      return roundFrenchPercentage(number * 100, 1);
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
