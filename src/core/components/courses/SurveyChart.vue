<template>
  <q-card class="card" flat>
    <div class="text-weight-bold">{{ card.question }}</div>
    <div class="q-mb-lg subtitle">{{ subtitle }}</div>
    <div class="bar-container">
      <div v-for="(line, index) in lines" :key="index" class="q-my-sm">
        <div class="bar rounded-borders">
          <div class="q-mt-sm bar-label">{{ index + 1 }}</div>
          <div class="bar-fill rounded-borders" :style="`height: ${line.percentage * 100}%`" />
        </div>
        <div class="percentage">{{ formatPercentage(line.percentage) }}</div>
      </div>
    </div>
    <div class="chart-footer">
      <div>{{ this.card.label.left }}</div>
      <div>{{ this.card.label.right }}</div>
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
      return roundFrenchPercentage(number * 100, 0);
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

.bar-container
  display: flex
  justify-content: space-evenly
  width: 304px

.bar
  position: relative
  color: $middle-beige
  background-color: $neutral-beige
  width: 48px
  height: 344px
  display: flex
  align-content: space-between
  flex-wrap: wrap

.chart-footer
  display: flex
  justify-content: space-between
  width: 304px

.bar-fill
  position: absolute
  bottom: 0px
  background-color: $middle-beige
  width: 48px

.bar-label
  z-index: 2
  font-size: 14px
  color: black
  text-align: center
  width: 100%
</style>
