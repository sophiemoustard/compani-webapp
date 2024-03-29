<template>
  <q-card class="card" flat>
    <div class="text-weight-bold">{{ card.question }}</div>
    <div class="q-mb-lg subtitle">{{ subtitle }}</div>
    <div class="chart">
      <div class="bar-container">
        <div v-for="(line, index) in lines" :key="index">
          <div class="bar bg-peach-100">
            <div class="bar-fill bg-peach-200" :style="`height: ${line.percentage * 100}%`" />
            <div class="q-mt-sm bar-label">{{ index + 1 }}</div>
          </div>
          <div class="percentage">{{ formatPercentage(line.percentage) }}</div>
        </div>
      </div>
      <div class="chart-footer">
        <div class="first-label">{{ this.card.labels['1'] }}</div>
        <div class="last-label">{{ this.card.labels['5'] }}</div>
      </div>
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

        return { title: pa, total, percentage: total / this.card.answers.length || 0 };
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

<style lang="sass" scoped>
.card
  padding: 16px 32px

.subtitle
  color: $copper-grey-800
  font-size: 14px

.percentage
  text-align: center
  @media screen and (max-width: 420px)
    font-size: 12px

.bar-container
  display: flex
  justify-content: space-between
  width: 312px
  @media screen and (max-width: 420px)
    width: 100%

.chart
  display: flex
  flex-direction: column

.bar
  position: relative
  border-radius: 8px
  width: 56px
  height: 160px
  @media screen and (max-width: 420px)
    width: 32px

.chart-footer
  display: flex
  justify-content: space-between
  width: 312px
  @media screen and (max-width: 420px)
    width: 100%

.first-label
  width: 30%

.last-label
  width: 30%
  text-align: right

.bar-fill
  position: absolute
  border-radius: 8px
  bottom: 0px
  width: 100%

.bar-label
  position: absolute
  font-size: 16px
  text-align: center
  width: 100%
</style>
